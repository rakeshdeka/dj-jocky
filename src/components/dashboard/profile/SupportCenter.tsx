
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { HelpCircle, MessageSquare, FileText, Phone, ExternalLink, ChevronRight, Search } from 'lucide-react';
import { toast } from 'sonner';

type FaqCategory = 'account' | 'billing' | 'design' | 'technical';

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
};

const SupportCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FaqCategory>('account');
  const [supportTicket, setSupportTicket] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  
  const faqItems: FaqItem[] = [
    {
      id: '1',
      question: 'How do I change my subscription plan?',
      answer: 'You can change your subscription plan by navigating to the Profile page, selecting the Subscription tab, and clicking on "Change Plan". Follow the instructions to select a new plan.',
      category: 'account'
    },
    {
      id: '2',
      question: 'Can I pause my subscription?',
      answer: 'Yes, you can pause your subscription by going to your Profile page, selecting the Subscription tab, and clicking on "Pause Subscription". Depending on your plan, you have a limited number of pauses per month.',
      category: 'account'
    },
    {
      id: '3',
      question: 'How can I update my payment method?',
      answer: 'To update your payment method, go to your Profile page, select the Payment tab, and click on "Add New Card". After adding a new card, you can set it as your default payment method or remove old cards.',
      category: 'billing'
    },
    {
      id: '4',
      question: 'What is the billing cycle?',
      answer: 'Your billing cycle starts on the date you initially subscribed. You will be charged automatically every month on this date unless you pause or cancel your subscription.',
      category: 'billing'
    },
    {
      id: '5',
      question: 'How do I submit a design brief?',
      answer: 'You can submit a design brief by navigating to the "Create Brief" section from the sidebar. Fill out the form with your design requirements and submit it. Our team will review and start working on it.',
      category: 'design'
    },
    {
      id: '6',
      question: 'What file formats do you support for design deliverables?',
      answer: 'We support various file formats including AI, PSD, PDF, JPG, PNG, and SVG. If you need a specific format, you can mention it in your brief or contact our support team.',
      category: 'design'
    },
    {
      id: '7',
      question: 'I\'m having issues accessing my account, what should I do?',
      answer: 'If you\'re having trouble accessing your account, try resetting your password. If that doesn\'t work, contact our support team and provide details about the issue you\'re experiencing.',
      category: 'technical'
    },
    {
      id: '8',
      question: 'How can I enable two-factor authentication?',
      answer: 'To enable two-factor authentication, go to your Profile page, select the Security tab, and toggle on the Two-Factor Authentication option. Follow the instructions to complete the setup.',
      category: 'technical'
    }
  ];
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSupportTicket({
      ...supportTicket,
      [name]: value
    });
  };
  
  const handleSubmitTicket = () => {
    // In a real app, you would submit the ticket to a backend
    // For this demo, we'll just show a success message
    if (!supportTicket.subject || !supportTicket.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    toast.success('Support ticket submitted successfully');
    setSupportTicket({
      subject: '',
      message: '',
      priority: 'medium'
    });
  };
  
  const toggleFaqItem = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };
  
  const filteredFaqs = faqItems.filter(item => {
    const matchesSearch = !searchQuery || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !activeCategory || item.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  const categories = [
    { id: 'account', label: 'Account', icon: <HelpCircle className="h-4 w-4" /> },
    { id: 'billing', label: 'Billing', icon: <FileText className="h-4 w-4" /> },
    { id: 'design', label: 'Design', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'technical', label: 'Technical', icon: <Phone className="h-4 w-4" /> }
  ];
  
  return (
    <div>
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold border-b border-border pb-4">Support Center</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FAQ Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-secondary/30 border-border">
              <CardContent className="p-6 space-y-6">
                <h3 className="font-medium text-lg">Frequently Asked Questions</h3>
                
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for answers..."
                    className="pl-10 bg-background/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={activeCategory === category.id ? 'default' : 'outline'}
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => setActiveCategory(category.id as FaqCategory)}
                    >
                      {category.icon}
                      {category.label}
                    </Button>
                  ))}
                </div>
                
                {filteredFaqs.length > 0 ? (
                  <div className="space-y-3">
                    {filteredFaqs.map((faq) => (
                      <div
                        key={faq.id}
                        className="rounded-lg overflow-hidden border border-border"
                      >
                        <div
                          className={`p-4 flex items-center justify-between cursor-pointer ${
                            expandedFaq === faq.id ? 'bg-[#C4FE01]/10' : 'bg-background/50'
                          }`}
                          onClick={() => toggleFaqItem(faq.id)}
                        >
                          <h4 className="font-medium">{faq.question}</h4>
                          <ChevronRight
                            className={`h-5 w-5 transition-transform ${
                              expandedFaq === faq.id ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                        
                        {expandedFaq === faq.id && (
                          <div className="p-4 bg-background/20 border-t border-border">
                            <p className="text-muted-foreground">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No FAQs found matching your search</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setSearchQuery('');
                        setActiveCategory('account');
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Support Options */}
          <div className="space-y-6">
     
            <Card className="bg-secondary/30 border-border">
              <CardContent className="p-6 space-y-6">
                <h3 className="font-medium text-lg">Submit a Ticket</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="Brief description of your issue"
                      className="bg-background/50"
                      value={supportTicket.subject}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Describe your issue in detail"
                      className="min-h-[120px] bg-background/50"
                      value={supportTicket.message}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <Button 
                    className="w-full bg-[#C4FE01]/80 hover:bg-[#C4FE01]/90"
                    onClick={handleSubmitTicket}
                  >
                    Submit Ticket
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportCenter;
