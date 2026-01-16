<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Stock extends Model
{
    protected $fillable = ['product_id', 'quantity', 'reserved_quantity', 'total_value'];

    protected $casts = [
        'total_value' => 'decimal:2'
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function updateStock(int $quantity, string $type = 'in')
    {
        if ($type === 'in') {
            $this->quantity += $quantity;
        } else {
            $this->quantity -= $quantity;
        }
        
        $this->total_value = $this->quantity * $this->product->purchase_price;
        $this->save();
    }
}