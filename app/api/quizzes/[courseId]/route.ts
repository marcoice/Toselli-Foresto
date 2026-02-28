import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const { searchParams } = new URL(request.url);
    const includeAnswers = searchParams.get('include_answers');

    const result = await db.execute({
      sql: 'SELECT * FROM quizzes WHERE course_id = ?',
      args: [Number(courseId)],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const quiz = result.rows[0];
    let questions = typeof quiz.questions === 'string' ? JSON.parse(quiz.questions) : quiz.questions;

    // Don't send correct answers to client during quiz
    if (!includeAnswers) {
      questions = questions.map((q: Record<string, unknown>) => {
        const { correct, explanation, ...rest } = q;
        void correct;
        void explanation;
        return rest;
      });
    }

    return NextResponse.json({
      ...quiz,
      questions,
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
