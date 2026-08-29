import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import Search from '../../../components/dashboard/ui/Search';
import BriefsGrid from "../../../components/dashboard/dashboard/BriefsGrid";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../../../components/dashboard/ui/sheet";
import { toast } from 'sonner';
import { Button } from '../../../components/dashboard/ui/button';
import { RootState } from '../../../store/store';
import { FileText, Download, UploadCloud } from 'lucide-react';

const Briefs = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  const { token, user } = useSelector((state: RootState) => state.auth);
  const role = user?.role;

  const [searchQuery, setSearchQuery] = useState("");
  const [briefs, setBriefs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedBrief, setSelectedBrief] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [isFilesLoading, setIsFilesLoading] = useState(false);

  const [uploadModal, setUploadModal] = useState<any>(null);
  const [uploadFile, setUploadFile] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  /* ================= FETCH BRIEFS ================= */
  const fetchBriefs = async () => {
    try {
      setIsLoading(true);

      const endpoint =
        role === "client"
          ? `${apiUrl}/client/briefs`
          : `${apiUrl}/designer/briefs`;

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBriefs(res.data.items || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load briefs");
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= FETCH FILES ================= */
  const fetchFiles = async (id: string) => {
    try {
      setIsFilesLoading(true);

      const res = await axios.get(`${apiUrl}/files/briefs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFiles(res.data.files || []);
    } catch (error: any) {
      toast.error("Failed to fetch files");
    } finally {
      setIsFilesLoading(false);
    }
  };

  useEffect(() => {
    if (token && role) fetchBriefs();
  }, [token, role]);

  /* ================= UPLOAD ================= */
  const handleUpload = async () => {
    if (!uploadFile || uploadFile.length === 0) {
      return toast.error("Select files");
    }

    const formData = new FormData();
    Array.from(uploadFile).forEach((file) => {
      formData.append("files", file);
    });

    try {
      setIsUploading(true);

      await axios.post(
        `${apiUrl}/files/briefs/${uploadModal.id}/delivery`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      toast.success("Files uploaded successfully");
      setUploadModal(null);
      setUploadFile(null);

    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <MainLayout>

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">ALL BRIEFS</h1>
        <p className="text-muted-foreground text-sm">
          Manage your design requests and assets
        </p>
      </div>
      <div className="mb-6">
        <Search onSearch={setSearchQuery} />
      </div>


      <BriefsGrid
        briefs={briefs}
        searchQuery={searchQuery}
        sortBy="date-created"
        isLoading={isLoading}
        onDeleted={(id) =>
          setBriefs(prev => prev.filter(b => b._id !== id))
        }
        onViewFiles={(id, title) => {
          setSelectedBrief({ id, title });
          fetchFiles(id);
        }}
        role="designer"
        onUploadDelivery={(id, title) =>
          setUploadModal({ id, title })
        }
      />

      {/* ================= VIEW FILES ================= */}
      <Sheet open={!!selectedBrief} onOpenChange={() => setSelectedBrief(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Files</SheetTitle>
            <SheetDescription>{selectedBrief?.title}</SheetDescription>
          </SheetHeader>

          {isFilesLoading ? (
            <div className="text-center py-20">Loading...</div>
          ) : files.length > 0 ? (
            <div className="mt-6 space-y-3">
              {files.map((file) => (
                <div
                  key={file._id}
                  className="flex items-center justify-between p-3 border rounded-md hover:border-[#C4FE01] transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {file.original_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {file.file_type || "file"}
                      </p>
                    </div>
                  </div>

                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 hover:bg-[#C4FE01] rounded"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-dashed border rounded-md">
              <p className="text-sm text-muted-foreground">
                No files available
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ================= UPLOAD ================= */}
      <Sheet open={!!uploadModal} onOpenChange={() => setUploadModal(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Upload Delivery</SheetTitle>
            <SheetDescription>{uploadModal?.title}</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">

            {/* Upload Box */}
            <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 cursor-pointer hover:border-[#C4FE01] transition">
              <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
              <p className="text-sm">Click to upload files</p>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => setUploadFile(e.target.files)}
              />
            </label>

            {/* Selected Files */}
            {uploadFile && (
              <div className="space-y-2 max-h-40 overflow-auto">
                {Array.from(uploadFile).map((file, i) => (
                  <div key={i} className="text-sm border p-2 rounded">
                    {file.name}
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full bg-[#C4FE01] text-black"
            >
              {isUploading ? "Uploading..." : "Upload Files"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

    </MainLayout>
  );
};

export default Briefs;