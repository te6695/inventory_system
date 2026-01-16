<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'sku',
        'name',
        'description',
        'category_id',
        'purchase_price',
        'selling_price',
        'reorder_level',
        'unit',
        'image',
        'is_active'
    ];

   protected $casts = [
    'is_active' => 'boolean',
    'purchase_price' => 'decimal:2',
    'selling_price' => 'decimal:2'
];

    protected static function boot()
    {
        parent::boot();

        static::created(function ($product) {
            $product->stock()->create(['quantity' => 0]);
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function stock(): HasOne
    {
        return $this->hasOne(Stock::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(InventoryTransaction::class);
    }

    public function getStockQuantityAttribute()
    {
        return $this->stock ? $this->stock->quantity : 0;
    }

    public function getAvailableQuantityAttribute()
    {
        return $this->stock ? $this->stock->available_quantity : 0;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeLowStock($query)
    {
        return $query->whereHas('stock', function ($q) {
            $q->where('quantity', '<=', \DB::raw('products.reorder_level'));
        });
    }
}