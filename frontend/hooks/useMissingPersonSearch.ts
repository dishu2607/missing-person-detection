import { useState } from "react";
import { api } from "@/lib/api";
import { ReferenceResult, CompareResult } from "@/types";

export function useMissingPersonSearch() {
  const [refFile, setRefFile] = useState<File | null>(null);
  const [refPreview, setRefPreview] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadingRef, setUploadingRef] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [refResults, setRefResults] = useState<ReferenceResult[]>([]);
  const [videoJobId, setVideoJobId] = useState("");
  const [compareResults, setCompareResults] = useState<CompareResult[]>([]);
  const [statusMsg, setStatusMsg] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set());
  const [searchAllVideos, setSearchAllVideos] = useState(true); // NEW

  const handleRefFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRefFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setRefPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refFile) return alert("Choose a reference image first");

    setUploadingRef(true);
    setStatusMsg("Processing reference image and generating embeddings...");

    try {
      const data = await api.uploadReference(refFile);
      setRefResults(data.results || []);
      setStatusMsg("✅ Reference embeddings generated successfully");
      setCurrentStep(2);
    } catch (err: any) {
      console.error(err);
      setStatusMsg(err?.message || "Error processing reference image");
    } finally {
      setUploadingRef(false);
    }
  };

  const uploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) return alert("Choose a video first");

    setUploadingVideo(true);
    setStatusMsg("Uploading video and extracting frames...");

    try {
      const data = await api.uploadVideo(videoFile);
      setVideoJobId(data.job_id || "");
      setStatusMsg(
        `✅ Video processed. Frames stored in database (Job ID: ${data.job_id})`
      );
      setCurrentStep(3);
    } catch (err: any) {
      console.error(err);
      setStatusMsg(err?.message || "Error processing video");
    } finally {
      setUploadingVideo(false);
    }
  };

  const searchInDatabase = async () => {
    if (!refResults.length) return alert("Upload a reference image first");

    const refId = refResults[0].person_id || refResults[0]._id;
    setIsSearching(true);
    setImageLoadErrors(new Set());
    
    const searchScope = searchAllVideos ? "all videos in database" : `video ${videoJobId}`;
    setStatusMsg(`Searching through ${searchScope} using reference embeddings...`);

    try {
      const data = await api.compareReference(
        refId,
        searchAllVideos ? null : videoJobId,
        20 // Top 10 matches
      );
      
      setCompareResults(data.matches || []);
      setStatusMsg(
        `✅ Search complete — Found ${data.matches_count || 0} top matches${data.searched_all_videos ? ' across all videos' : ''}`
      );
      setCurrentStep(4);
    } catch (err: any) {
      console.error(err);
      setStatusMsg(err?.message || "Error during search");
    } finally {
      setIsSearching(false);
    }
  };

  return {
    refFile,
    refPreview,
    videoFile,
    uploadingRef,
    uploadingVideo,
    refResults,
    videoJobId,
    compareResults,
    statusMsg,
    isSearching,
    currentStep,
    imageLoadErrors,
    searchAllVideos,
    setRefFile,
    setVideoFile,
    setVideoJobId,
    setImageLoadErrors,
    setSearchAllVideos,
    handleRefFileChange,
    uploadReference,
    uploadVideo,
    searchInDatabase,
  };
}