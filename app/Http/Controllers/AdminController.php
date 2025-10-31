<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class AdminController extends Controller
{
    public function index(Request $request)
    {
        // Adapte selon ta structure de rôles
        $admins = User::whereIn('role', ['admin', 'super_admin'])->get();
        return response()->json($admins);
    }
}
