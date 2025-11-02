"use client";

import { Header } from "@/components/Header";
import { WorkflowProgress } from "@/components/WorkflowProgress";
import { StatusMessage } from "@/components/StatusMessage";
import { ReferenceUpload } from "@/components/ReferenceUpload";
import { VideoUpload } from "@/components/VideoUpload";
import { SearchButton } from "@/components/SearchButton";
import { MatchResults } from "@/components/MatchResults";
import { SystemInfo } from "@/components/SystemInfo";
import { useMissingPersonSearch } from "@/hooks/useMissingPersonSearch";

export default function Dashboard() {
  const {
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
    setVideoFile,
    setVideoJobId,
    setImageLoadErrors,
    setSearchAllVideos,
    handleRefFileChange,
    uploadReference,
    uploadVideo,
    searchInDatabase,
  } = useMissingPersonSearch();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <WorkflowProgress currentStep={currentStep} />

        <StatusMessage message={statusMsg} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ReferenceUpload
            refFile={refFile}
            refPreview={refPreview}
            uploadingRef={uploadingRef}
            refResults={refResults}
            onFileChange={handleRefFileChange}
            onUpload={uploadReference}
          />

          <VideoUpload
            videoFile={videoFile}
            uploadingVideo={uploadingVideo}
            videoJobId={videoJobId}
            searchAllVideos={searchAllVideos}
            onFileChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            onUpload={uploadVideo}
            onJobIdChange={setVideoJobId}
            onSearchModeChange={setSearchAllVideos}
          />
        </div>

        <SearchButton
          isSearching={isSearching}
          disabled={isSearching || !refResults.length || (!searchAllVideos && !videoJobId)}
          onClick={searchInDatabase}
          refId={refResults[0]?.person_id || ''}
          searchAllVideos={searchAllVideos}
        />

        <MatchResults
          compareResults={compareResults}
          refPreview={refPreview}
          refResults={refResults}
          imageLoadErrors={imageLoadErrors}
          onImageError={(index) => setImageLoadErrors(prev => new Set(prev).add(index))}
        />

        <SystemInfo />
      </div>
    </div>
  );
}