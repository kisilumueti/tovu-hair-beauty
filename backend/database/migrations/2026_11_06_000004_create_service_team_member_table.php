<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_team_member', function (Blueprint $table): void {
            $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();
            $table->foreignId('salon_team_member_id')->constrained('salon_team_members')->cascadeOnDelete();
            $table->timestamps();

            $table->primary(['service_id', 'salon_team_member_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_team_member');
    }
};
