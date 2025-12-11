import { NextRequest, NextResponse } from 'next/server';

import { auditSkills } from '@/features/skill-audit/auditSkills';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText, jobDescriptionText } = body;

    // Validate required fields
    if (!resumeText || !jobDescriptionText) {
      return NextResponse.json(
        { error: 'Both resume text and job description are required' },
        { status: 400 },
      );
    }

    return auditSkills({ resumeText, jobDescriptionText }).toTextStreamResponse();
  } catch (error) {
    console.error('Error auditing skills:', error);
    return NextResponse.json(
      { error: 'Failed to audit skills. Please try again.' },
      { status: 500 },
    );
  }
}
