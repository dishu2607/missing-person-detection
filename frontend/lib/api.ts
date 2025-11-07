const API_BASE = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

export const api = {
  baseUrl: API_BASE,

  async uploadReference(file: File) {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(`${API_BASE}/reference/add`, {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to upload reference: ${error}`);
    }
    return res.json();
  },

  async uploadVideo(file: File) {
    const fd = new FormData();
    fd.append("video", file);

    const res = await fetch(`${API_BASE}/video/upload`, {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to upload video: ${error}`);
    }
    return res.json();
  },

  async compareReference(referenceId: string, jobId: string | null = null, topK: number = 10) {
    console.log('Comparing with:', { referenceId, jobId, topK });
    
    const body: any = {
      reference_id: referenceId,
      top_k: topK,
    };
    
    // Only add job_id if it's not null and not empty
    if (jobId && jobId.trim() !== '') {
      body.job_id = jobId;
    }

    const res = await fetch(`${API_BASE}/compare/`, {  // FIXED: Added backticks properly
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Compare API error:', errorText);
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.detail || "Failed to compare");
      } catch {
        throw new Error(`Failed to compare: ${errorText}`);
      }
    }
    return res.json();
  },

  getImageUrl(filename: string) {
    return `${API_BASE}/outputs/search/${filename}`;
  },

  getVideoStreamUrl(jobId: string) {
    return `${API_BASE}/videos/stream/${jobId}`;
  },

  getVideoThumbnailUrl(jobId: string, frameNumber: number) {
    return `${API_BASE}/videos/thumbnail/${jobId}?frame_number=${frameNumber}`;
  },

  async getVideoInfo(jobId: string) {
    const res = await fetch(`${API_BASE}/videos/info/${jobId}`);
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to get video info: ${error}`);
    }
    return res.json();
  },
};