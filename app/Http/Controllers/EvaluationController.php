<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EvaluationController extends Controller
{
    // Récupérer la note d'un étudiant pour un cours
    public function show($courseId, $studentId)
    {
        $evaluation = Evaluation::where('course_id', $courseId)
            ->where('student_id', $studentId)
            ->first();
        if (!$evaluation) {
            return response()->json(['grade' => null, 'comment' => null], 200);
        }
        return response()->json($evaluation);
    }

    // Créer ou mettre à jour la note d'un étudiant pour un cours
    public function storeOrUpdate(Request $request, $courseId, $studentId)
    {
        $request->validate([
            'grade' => 'nullable|numeric|min:0|max:20',
            'comment' => 'nullable|string',
        ]);

        $user = Auth::user();
        if (!$user || !$user->isTeacher()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $evaluation = Evaluation::updateOrCreate(
            [
                'course_id' => $courseId,
                'student_id' => $studentId,
            ],
            [
                'grade' => $request->input('grade'),
                'comment' => $request->input('comment'),
                'evaluated_by' => $user->id,
                'evaluated_at' => now(),
            ]
        );

        return response()->json($evaluation);
    }
}
