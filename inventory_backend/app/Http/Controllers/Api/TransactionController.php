<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryTransaction;
use App\Models\Product;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    

    public function index(Request $request)
    {
        $query = InventoryTransaction::with(['product', 'user'])
            ->when($request->type, function ($q) use ($request) {
                $q->where('type', $request->type);
            })
            ->when($request->date_from, function ($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->date_from);
            })
            ->when($request->date_to, function ($q) use ($request) {
                $q->whereDate('created_at', '<=', $request->date_to);
            })
            ->orderBy('created_at', 'desc');

        $transactions = $request->has('per_page') 
            ? $query->paginate($request->per_page)
            : $query->get();

        return response()->json($transactions);
    }

    public function purchase(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'reference_number' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        return DB::transaction(function () use ($request) {
            $product = Product::findOrFail($request->product_id);
            $totalAmount = $request->quantity * $request->unit_price;

            // Create transaction
            $transaction = InventoryTransaction::create([
                'product_id' => $product->id,
                'type' => 'purchase',
                'quantity' => $request->quantity,
                'unit_price' => $request->unit_price,
                'total_amount' => $totalAmount,
                'user_id' => $request->user()->id,
                'notes' => $request->notes,
                'reference_number' => $request->reference_number,
            ]);

            // Update stock
            $stock = Stock::where('product_id', $product->id)->first();
            if ($stock) {
                $stock->updateStock($request->quantity, 'in');
                $stock->update(['last_restocked_at' => now()]);
            }

            return response()->json($transaction->load(['product', 'user']), 201);
        });
    }

    public function sale(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'reference_number' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        return DB::transaction(function () use ($request) {
            $product = Product::findOrFail($request->product_id);
            $stock = Stock::where('product_id', $product->id)->first();

            // Check stock availability
            if (!$stock || $stock->available_quantity < $request->quantity) {
                return response()->json([
                    'message' => 'Insufficient stock. Available: ' . ($stock ? $stock->available_quantity : 0)
                ], 400);
            }

            $totalAmount = $request->quantity * $request->unit_price;

            // Create transaction
            $transaction = InventoryTransaction::create([
                'product_id' => $product->id,
                'type' => 'sale',
                'quantity' => $request->quantity,
                'unit_price' => $request->unit_price,
                'total_amount' => $totalAmount,
                'user_id' => $request->user()->id,
                'notes' => $request->notes,
                'reference_number' => $request->reference_number,
            ]);

            // Update stock
            $stock->updateStock($request->quantity, 'out');

            return response()->json($transaction->load(['product', 'user']), 201);
        });
    }

    public function dailyReport()
    {
        $today = now()->format('Y-m-d');
        
        $data = [
            'date' => $today,
            'total_purchases' => InventoryTransaction::whereDate('created_at', $today)
                ->purchase()
                ->sum('total_amount'),
            'total_sales' => InventoryTransaction::whereDate('created_at', $today)
                ->sale()
                ->sum('total_amount'),
            'transaction_count' => InventoryTransaction::whereDate('created_at', $today)->count(),
            'top_products' => InventoryTransaction::whereDate('created_at', $today)
                ->with('product')
                ->select('product_id', DB::raw('SUM(quantity) as total_quantity'))
                ->groupBy('product_id')
                ->orderBy('total_quantity', 'desc')
                ->take(5)
                ->get(),
        ];

        return response()->json($data);
    }
}