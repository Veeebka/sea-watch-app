<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateOperationAreasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
//        Schema::create('operation_areas', function (Blueprint $table) {
//            $table->increments('id');
//            $table->string('title');
//            $table->json('polygon_coordinates');
//            $table->integer('user_id');
//            $table->integer('active');
//            $table->timestamps();
//        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('operation_areas');
    }
}
