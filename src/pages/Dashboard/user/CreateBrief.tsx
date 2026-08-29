import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../../components/dashboard/layout/MainLayout';
import { Input } from '../../../components/dashboard/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../../components/dashboard/ui/select';
import { Textarea } from '../../../components/dashboard/ui/textarea';
import { Button } from '../../../components/dashboard/ui/button';
import { Calendar } from '../../../components/dashboard/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '../../../components/dashboard/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Upload, Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import axios from 'axios';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import {
  briefToFormValues,
  createBrief,
  fetchBrief,
  type BriefFormValues,
  updateBrief,
} from '../../../lib/briefs-api';

const apiUrl = import.meta.env.VITE_API_URL;

const emptyFormValues: BriefFormValues = {
  title: '',
  description: '',
  service_id: '',
  priority: 'medium',
  delivery_date: '',
};

const CreateBrief = () => {
  const { id } = useParams();
  const isEditMode = !!id;

  const { token } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState<BriefFormValues>(emptyFormValues);
  const [originalValues, setOriginalValues] = useState<BriefFormValues | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEditable, setIsEditable] = useState(true);

  const [services, setServices] = useState<any[]>([]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [allFiles, setAllFiles] = useState<File[]>([]);

  const updateField = <K extends keyof BriefFormValues>(key: K, value: BriefFormValues[K]) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(`${apiUrl}/services/dropdown`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        const allServices = res.data.categories.flatMap((cat: any) =>
          (cat.services || []).map((srv: any) => ({
            ...srv,
            id: srv.id || srv._id,
          })),
        );
        setServices(allServices);
      } catch {
        toast.error('Failed to load services');
      }
    };
    if (token) fetchServices();
  }, [token]);

  const loadBrief = useCallback(async () => {
    if (!isEditMode || !id) return;

    if (!token) {
      setIsFetching(true);
      return;
    }

    try {
      setIsFetching(true);
      setLoadError(null);
      const brief = await fetchBrief(token, id);
      const values = briefToFormValues(brief);

      setFormValues(values);
      setOriginalValues(values);
      setIsEditable(true);

      if (brief.delivery_date) {
        setDate(new Date(brief.delivery_date));
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to fetch brief details';
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsFetching(false);
    }
  }, [id, isEditMode, token]);

  useEffect(() => {
    loadBrief();
  }, [loadBrief]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArray = Array.from(files);
    setAllFiles(fileArray);
    toast.success(`${fileArray.length} file(s) selected`);
  };

  const handleSave = async () => {
    if (!formValues.title.trim() || !formValues.description.trim()) {
      toast.error('Title and Description are required');
      return;
    }

    if (isEditMode && !isEditable) {
      toast.error('This brief can no longer be edited');
      return;
    }

    const payload: BriefFormValues = {
      ...formValues,
      title: formValues.title.trim(),
      description: formValues.description.trim(),
      delivery_date: date ? date.toISOString() : '',
    };

    try {
      setIsLoading(true);

      const files = {
        thumbnail,
        files: allFiles.length > 0 ? allFiles : undefined,
      };

      if (isEditMode && id) {
        await updateBrief(token, id, payload, files, originalValues || undefined);
        toast.success('Brief updated successfully');
      } else {
        await createBrief(token, payload, files);
        toast.success('Brief created successfully');
      }

      navigate('/client/briefs');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <MainLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#c5fb00]" />
        </div>
      </MainLayout>
    );
  }

  if (isEditMode && loadError) {
    return (
      <MainLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-muted-foreground">{loadError}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/client/briefs')}>
              Back to Briefs
            </Button>
            <Button className="bg-[#c5fb00] hover:bg-[#b0e000] text-black" onClick={loadBrief}>
              Retry
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{isEditMode ? 'Edit Brief' : 'Create Brief'}</h1>
            <p className="text-muted-foreground">
              {isEditMode
                ? isEditable
                  ? 'Update the details for your existing brief'
                  : 'This brief can no longer be edited'
                : 'Fill in the details for your design brief'}
            </p>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-md font-medium">Project Name</label>
                <Input
                  value={formValues.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  disabled={!isEditable}
                />
              </div>

              <div className="space-y-2">
                <label className="text-md font-medium">Service</label>
                <Select
                  value={formValues.service_id}
                  onValueChange={(value) => updateField('service_id', value)}
                  disabled={!isEditable}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((srv: any) => (
                      <SelectItem key={srv.id} value={srv.id}>{srv.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-md font-medium">Priority</label>
                <Select
                  value={formValues.priority}
                  onValueChange={(value) => updateField('priority', value as BriefFormValues['priority'])}
                  disabled={!isEditable}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-md font-medium">Describe project</label>
              <Textarea
                value={formValues.description}
                onChange={(e) => updateField('description', e.target.value)}
                className="min-h-[200px]"
                disabled={!isEditable}
              />
            </div>

            <div className="space-y-2">
              <label className="text-md font-medium">Upload Files</label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <label className={`flex flex-col items-center gap-2 ${isEditable ? 'cursor-pointer' : 'opacity-50'}`}>
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload or drag files</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={!isEditable}
                  />
                </label>
              </div>
              {allFiles.length > 0 && (
                <p className="text-sm text-green-500">{allFiles.length} new file(s) selected</p>
              )}
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={!isEditable}
                  className={cn('w-[240px] justify-start text-left font-normal', !date && 'text-muted-foreground')}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : 'Delivery date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>

            <div className="space-y-2">
              <label className="text-md font-medium">Thumbnail</label>
              <Input
                type="file"
                accept="image/*"
                disabled={!isEditable}
                onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
              />
            </div>

            <Button
              className="bg-[#c5fb00] hover:bg-[#b0e000] text-black font-semibold px-8"
              onClick={handleSave}
              disabled={isLoading || (isEditMode && !isEditable)}
            >
              {isLoading ? 'Saving...' : isEditMode ? 'Update Brief' : 'Publish'}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateBrief;
