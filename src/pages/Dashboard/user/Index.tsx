import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { fetchMyBriefs } from '../../../lib/briefs-api';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import Search from '../../../components/dashboard/ui/Search';
import SortDropdown from '../../../components/dashboard/ui/SortDropdown';
import BriefsGrid from "../../../components/dashboard/dashboard/BriefsGrid";
import { Plus, FileIcon, Loader2, Download } from 'lucide-react';
import { Button } from '../../../components/dashboard/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../../../components/dashboard/ui/sheet";
import { toast } from 'sonner';
import { RootState } from '../../../store/store';
import { Link } from 'react-router-dom';

const sortOptions = [
  { value: "date-created", label: "Date Created" },
  { value: "date-updated", label: "Last Updated" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
];

const Index = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  // ✅ GET FROM REDUX
  const { token } = useSelector((state: RootState) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-created");
  const [briefs, setBriefs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // File viewing states
  const [selectedBrief, setSelectedBrief] = useState<{ id: string; title: string } | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [isFilesLoading, setIsFilesLoading] = useState(false);

  /* ================= FETCH ALL BRIEFS ================= */
  const fetchBriefs = async () => {
    try {
      setIsLoading(true);
      const items = await fetchMyBriefs(token);
      setBriefs(items);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load briefs");
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= FETCH FILES FOR SPECIFIC BRIEF ================= */
  const fetchBriefFiles = async (briefId: string) => {
    try {
      setIsFilesLoading(true);
      setFiles([]); // Reset files while loading
      const res = await axios.get(`${apiUrl}/files/briefs/${briefId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      // Adjusting based on standard list response
      setFiles(res.data.files || res.data.items || []);
    } catch (error: any) {
      toast.error("Failed to fetch brief assets");
    } finally {
      setIsFilesLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchBriefs();
  }, [token]);

  const handleOpenFiles = (id: string, title: string) => {
    setSelectedBrief({ id, title });
    fetchBriefFiles(id);
  };

  const handleDeleted = (id: string) => {
    setBriefs((prev) => prev.filter((b) => b._id !== id));
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-sm font-bold mb-1 tracking-[0.2em]">ALL BRIEFS</h1>
        <p className="text-muted-foreground text-sm ">Manage your design requests and associated assets</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        {/* Updated wrapper to expand fully using flex-1 and w-full */}
        <div className="flex-1 w-full">
          <Search onSearch={setSearchQuery} />
        </div>
        <div className="flex gap-4 items-center w-full sm:w-auto justify-between sm:justify-end">
          <SortDropdown options={sortOptions} defaultValue="date-created" onSort={setSortBy} />
          <Link to="/client/create-brief">
            <Button className="bg-[#C4FE01] hover:bg-[#b2e600] text-black">
              <Plus className="mr-2 h-4 w-4" /> Create
            </Button>
          </Link>
        </div>
      </div>

      <BriefsGrid
        briefs={briefs}
        searchQuery={searchQuery}
        sortBy={sortBy}
        isLoading={isLoading}
        onDeleted={handleDeleted}
        onViewFiles={handleOpenFiles}
        role="client"
        onUploadDelivery={() => {}}
      />

      {/* ASSET DRAWER */}
      <Sheet open={!!selectedBrief} onOpenChange={() => setSelectedBrief(null)}>
        <SheetContent className="sm:max-w-md font-sans">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <FileIcon className="h-5 w-5 text-[#C4FE01]" /> Brief Assets
            </SheetTitle>
            <SheetDescription>Viewing files for: {selectedBrief?.title}</SheetDescription>
          </SheetHeader>

          {isFilesLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#C4FE01]" />
              <p className="text-sm text-muted-foreground mt-2">Loading files...</p>
            </div>
          ) : files.length > 0 ? (
            <div className="space-y-3">
              {files.map((file: any) => (
                <div key={file._id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-background p-2 rounded border group-hover:border-[#C4FE01] transition-colors">
                      <FileIcon className="h-4 w-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium truncate">{file.original_name || "Attachment"}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{file.file_type || 'File'}</p>
                    </div>
                  </div>
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 hover:bg-[#C4FE01] hover:text-black rounded-md transition-colors"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-xl">
              <p className="text-muted-foreground text-sm">No files found for this brief.</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
};

export default Index;