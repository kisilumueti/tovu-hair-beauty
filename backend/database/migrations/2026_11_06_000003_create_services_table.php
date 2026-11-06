<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('professional_profile_id')->constrained('professional_profiles')->cascadeOnDelete();
            $table->string('name', 160);
            $table->string('slug', 180);
            $table->string('category', 80)->index();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('price_minor');
            $table->char('currency', 3)->default('KES');
            $table->unsignedSmallInteger('duration_minutes');
            $table->unsignedSmallInteger('buffer_before_minutes')->default(0);
            $table->unsignedSmallInteger('buffer_after_minutes')->default(0);
            $table->boolean('is_active')->default(true)->index();
            $table->boolean('requires_consultation')->default(false);
            $table->timestamps();

            $table->unique(['professional_profile_id', 'slug']);
            $table->index(['professional_profile_id', 'is_active', 'category'], 'services_public_catalogue_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
