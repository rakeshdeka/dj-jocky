import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import FolderCard from '../brief/FolderCard';
import { cn } from '../../../lib/utils';

// Dummy options
const serviceOptions = [
  { value: 'brand-identity', label: 'Brand Identity' },
  { value: 'web-design', label: 'Web Design' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'print', label: 'Print Material' },
  { value: 'illustration', label: 'Illustration' },
];

const clientOptions = [
  'Acme Corp', 'Globex Inc', 'Umbrella Ltd', 'Stark Industries', 'Wayne Enterprises', 'Initech', 'Soylent Corp', 'Hooli', 'Cyberdyne Systems'
];

const folderCategories = ['Guidelines', 'Icons', 'Logos', 'Images', 'Fonts', 'Templates', 'Illustrations'];

const AddProject = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [projectName, setProjectName] = useState(isEditing ? 'New Branding' : '');
  const [service, setService] = useState('brand-identity');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const filteredClients = clientOptions.filter(client =>
    client.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const handleUpload = (folder: string) => {
    toast.info(`Upload to ${folder} folder coming soon!`);
  };

  const handleSave = (publish = false) => {
    if (!projectName) return toast.error('Project name is required');
    if (!selectedClient) return toast.error('Please select a client');
    if (publish) toast.success('Project published successfully!');
    else toast.success('Project saved as draft!');
  };

  return (
    <MainLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{isEditing ? 'Edit Project' : 'Add Project'}</h1>
          <p className="text-muted-foreground">
            {isEditing
              ? 'Update your design Project details and requirements'
              : 'Fill in the details to create a new design Project'}
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>

      <div className="space-y-8 font-sans">
        {/* Project Name & Service */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-md font-medium">Project Name</label>
            <Input
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-md font-medium">Service</label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full p-2 rounded-md border border-border bg-background"
            >
              {serviceOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Client Search/Select */}
        <div className="space-y-2">
          <label className="text-md font-medium">Client</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left">
                {selectedClient || 'Search and select a client'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full max-w-sm">
              <Input
                placeholder="Search client..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="mb-2"
              />
              <div className="max-h-48 overflow-y-auto">
                {filteredClients.map((client) => (
                  <div
                    key={client}
                    onClick={() => {
                      setSelectedClient(client);
                      setClientSearch('');
                    }}
                    className="px-2 py-1 hover:bg-muted cursor-pointer rounded-md"
                  >
                    {client}
                  </div>
                ))}
                {filteredClients.length === 0 && (
                  <p className="text-muted-foreground text-sm">No clients found</p>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Project Description */}
        <div className="space-y-2">
          <label className="text-md font-medium">Describe project</label>
          <Textarea
            placeholder="Describe your project details, target audience, and key design preferences..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[200px]"
          />
        </div>

        {/* Folder Uploads */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">File Attachments</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {folderCategories.map((folder) => (
              <FolderCard key={folder} title={folder} onUpload={() => handleUpload(folder)} />
            ))}
          </div>
        </div>

        {/* Delivery Date */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Delivery Date</h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full sm:w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Select delivery date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button variant="outline" onClick={() => handleSave(false)}>
            <Save className="mr-2 h-4 w-4" /> Save
          </Button>
          <Button
            className="bg-[#c5fb00] hover:bg-[#b0e000] text-black font-semibold px-8"
            onClick={() => handleSave(true)}
          >
            Publish
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default AddProject;
