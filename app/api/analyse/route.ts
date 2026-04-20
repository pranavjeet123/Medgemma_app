import { NextRequest, NextResponse } from "next/server";
import { Client } from "@gradio/client";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const imageFile = formData.get("image") as File | null;
    const question = formData.get("question") as string | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: "Image file is required." },
        { status: 400 }
      );
    }

    if (!question || question.trim() === "") {
      return NextResponse.json(
        { error: "Question prompt is required." },
        { status: 400 }
      );
    }

    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
      return NextResponse.json(
        {
          error:
            "HF_TOKEN environment variable is not set. "
        },
        { status: 500 }
      );
    }

    // Convert the uploaded File to a Blob for the Gradio client
    const arrayBuffer = await imageFile.arrayBuffer();
    const imageBlob = new Blob([arrayBuffer], { type: imageFile.type });

    const client = await Client.connect("Pranavjeet/dental_demo", {
      hf_token: hfToken as `hf_${string}`,
    });

    const result = await client.predict("/analyze", {
      image: imageBlob,
      question: question.trim(),
    });

    return NextResponse.json({ data: result.data }, { status: 200 });
  } catch (error: unknown) {
    console.error("[/api/analyse] Error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
