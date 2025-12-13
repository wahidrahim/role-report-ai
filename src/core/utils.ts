const encoder = new TextEncoder();

export const sendDataFn =
  (controller: ReadableStreamDefaultController) => (type: string, data: unknown) => {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`));
  };
