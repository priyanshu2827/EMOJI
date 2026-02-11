
import { NextRequest, NextResponse } from 'next/server';
import { DetectionEngine } from '@/lib/detection-engine';
import { Severity } from '@/lib/types';
import * as unicode from '@/lib/unicode';

export async function POST(req: NextRequest) {
    try {
        let text = '';
        let imageBuffer: ArrayBuffer | null = null;
        let mimeType = 'text/plain';

        const contentType = req.headers.get('content-type') || '';

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            text = formData.get('text') as string || '';
            const imageFile = formData.get('image') as File | null;
            if (imageFile && imageFile.size > 0) {
                imageBuffer = await imageFile.arrayBuffer();
                mimeType = imageFile.type;
            }
        } else {
            const body = await req.json();
            text = body.text || '';
            mimeType = body.mimeType || 'text/plain';
        }

        if (!text && !imageBuffer) {
            return NextResponse.json({ error: 'No content provided' }, { status: 400 });
        }

        // Run link analysis
        const linkAnalysis = unicode.detect_homoglyph_links(text);

        // Run main detection engine
        const imagePixels = imageBuffer ? Array.from(new Uint8Array(imageBuffer)) : null;
        const detection = await DetectionEngine.analyze(
            text,
            imageBuffer,
            imagePixels,
            mimeType
        );

        const engineSeverity = detection.severity;
        let severity: Severity = 'CLEAN';
        if (engineSeverity === 'Critical' || engineSeverity === 'High' || linkAnalysis.detected) {
            severity = 'HIGH-RISK';
        } else if (engineSeverity === 'Medium' || engineSeverity === 'Low') {
            severity = 'SUSPICIOUS';
        }

        const res = NextResponse.json({
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            type: detection.type,
            severity,
            score: detection.score,
            findings: {
                ...detection.findings,
                link_analysis: linkAnalysis
            },
            reasons: [
                ...detection.reasons,
                ...(linkAnalysis.detected ? ['homoglyph_links_detected'] : [])
            ]
        });

        res.headers.set('Access-Control-Allow-Origin', '*');
        return res;

    } catch (error: any) {
        console.error('API Scan Error:', error);
        const errRes = NextResponse.json({
            error: error.message || 'Internal Server Error',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
        errRes.headers.set('Access-Control-Allow-Origin', '*');
        return errRes;
    }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
