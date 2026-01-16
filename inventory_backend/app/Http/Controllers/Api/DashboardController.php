<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\InventoryTransaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    

    public function stats()
    {
        $totalProducts = Product::active()->count();
        $totalCategories = \App\Models\Category::count();
        $totalUsers = User::count();
        
        $lowStockProducts = Product::lowStock()->active()->count();
        
        $todaySales = InventoryTransaction::whereDate('created_at', today())
            ->sale()
            ->sum('total_amount');
        
        $monthlySales = InventoryTransaction::whereMonth('created_at', now()->month)
            ->sale()
            ->sum('total_amount');

        $recentTransactions = InventoryTransaction::with(['product', 'user'])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        $topProducts = Product::with('stock')
            ->orderByRaw('(SELECT quantity FROM stocks WHERE products.id = stocks.product_id)')
            ->take(5)
            ->get();

        return response()->json([
            'stats' => [
                'total_products' => $totalProducts,
                'total_categories' => $totalCategories,
                'total_users' => $totalUsers,
                'low_stock_products' => $lowStockProducts,
                'today_sales' => $todaySales,
                'monthly_sales' => $monthlySales,
            ],
            'recent_transactions' => $recentTransactions,
            'top_products' => $topProducts,
        ]);
    }

    public function salesChart(Request $request)
    {
        $days = $request->get('days', 30);
        
        $sales = InventoryTransaction::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(CASE WHEN type = "sale" THEN total_amount ELSE 0 END) as sales'),
                DB::raw('SUM(CASE WHEN type = "purchase" THEN total_amount ELSE 0 END) as purchases')
            )
            ->whereDate('created_at', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($sales);
    }
}