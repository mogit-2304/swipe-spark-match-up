import React, { useState, useEffect } from 'react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Copy } from "lucide-react";
import { Button } from '@/components/ui/button';
import CardPreview from '@/components/CardPreview';
import { generatePRDSummary } from '@/services/openaiService';

export interface CardData {
  id: string;
  content: string;
  category: string;
  approvedCount: number;
  rejectedCount: number;
  suggestions: {
    id: string;
    suggestion: string;
    date: string;
    author: string;
  }[];
}

interface JiraTicketDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  cardData: CardData;
  onUpdateCard?: (cardId: string, updates: Partial<CardData>) => void;
}

const JiraTicketDialog: React.FC<JiraTicketDialogProps> = ({ 
  isOpen, 
  setIsOpen, 
  cardData,
  onUpdateCard
}) => {
  const [summary, setSummary] = useState(`${cardData.content}`);
  const [description, setDescription] = useState('');
  
  // Set initial description with suggestions when dialog opens
  useEffect(() => {
    if (isOpen && cardData.suggestions.length > 0) {
      const suggestionsText = cardData.suggestions
        .map(s => `- ${s.suggestion}`)
        .join('\n');
      setDescription(suggestionsText);
    }
  }, [isOpen, cardData.suggestions]);
  
  // Format suggestions to create a prompt for ChatGPT
  const formatContent = () => {
    let content = `Main Idea: ${cardData.content}\n\n`;
    content += `Category: ${cardData.category}\n`;
    content += `Approvals: ${cardData.approvedCount}, Rejections: ${cardData.rejectedCount}\n\n`;
    
    if (description.trim()) {
      content += `Additional Description: ${description}\n\n`;
    }
    
    if (cardData.suggestions.length > 0) {
      content += "Suggestions:\n";
      cardData.suggestions.forEach((suggestion, index) => {
        content += `${index + 1}. ${suggestion.suggestion} (by ${suggestion.author})\n`;
      });
    }
    
    return content;
  };
  
  // Format the card data into a structured JIRA-like ticket format
  const formatJiraDescription = () => {
    let jiraDescription = `Summary\nPB: ${cardData.content}\nDescription\n\n`;
    
    // Add user-entered description if available
    if (description.trim()) {
      jiraDescription += `${description}\n\n`;
    } else if (cardData.suggestions.length > 0) {
      // If no manual description but suggestions exist, add them as description
      jiraDescription += "Suggestion Highlights:\n";
      cardData.suggestions.forEach((suggestion) => {
        jiraDescription += `- ${suggestion.suggestion}\n`;
      });
      jiraDescription += "\n";
    }
    
    // Add metadata
    jiraDescription += `*Card ID:* ${cardData.id}\n`;
    jiraDescription += `*Category:* ${cardData.category}\n`;
    jiraDescription += `*Approval Count:* ${cardData.approvedCount}\n`;
    jiraDescription += `*Rejection Count:* ${cardData.rejectedCount}\n\n`;
    
    // Add detailed suggestions section
    if (cardData.suggestions.length > 0) {
      jiraDescription += `h2. Suggestions\n\n`;
      cardData.suggestions.forEach(suggestion => {
        jiraDescription += `----\n`;
        jiraDescription += `*Suggestion:* ${suggestion.suggestion}\n`;
        jiraDescription += `*By:* ${suggestion.author}\n`;
        jiraDescription += `*Date:* ${suggestion.date}\n`;
        jiraDescription += `----\n\n`;
      });
    } else {
      jiraDescription += "No suggestions available.";
    }
    
    return jiraDescription;
  };
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [prdSummary, setPrdSummary] = useState("");
  
  const generatePRD = async () => {
    setIsGenerating(true);
    
    try {
      const contentToSummarize = formatContent();
      
      const generatedPRD = await generatePRDSummary(contentToSummarize);
      
      // Update only the suggestions array of the current card
      if (onUpdateCard) {
        onUpdateCard(cardData.id, {
          suggestions: [...cardData.suggestions, {
            id: Date.now().toString(),
            suggestion: generatedPRD,
            date: new Date().toISOString(),
            author: "ChatGPT"
          }]
        });
      }
      
      // Combine the JIRA-style formatted description with the AI-generated PRD
      const formattedPRD = formatJiraDescription() + "\nh2. AI-Generated PRD Summary\n\n" + generatedPRD;
      setPrdSummary(formattedPRD);
      
      toast.success("PRD successfully generated!");
    } catch (error) {
      console.error("Error generating PRD:", error);
      toast.error("Failed to generate PRD. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(prdSummary)
      .then(() => toast.success("PRD copied to clipboard!"))
      .catch(() => toast.error("Failed to copy to clipboard"));
  };

  const handleDialogClose = () => {
    // Reset the dialog state
    setPrdSummary("");
    setIsOpen(false);
  };

  // Card preview data
  const cardPreview = {
    content: cardData.content,
    category: cardData.category
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <AlertDialogHeader>
          <AlertDialogTitle>Summarize Content</AlertDialogTitle>
          <AlertDialogDescription>
            Generate a Product Requirements Document based on this card's content and suggestions.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 py-4 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Card Preview */}
          <div className="w-full h-[200px] relative mb-6">
            <CardPreview card={cardPreview} />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="summary" className="text-sm font-medium">Summary</label>
            <Input
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Summary"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add additional context or description about the suggestions"
              className="min-h-[100px]"
            />
          </div>
          
          {!prdSummary ? (
            <div className="flex justify-center pt-4">
              <Button 
                onClick={generatePRD}
                disabled={isGenerating}
                className="bg-gradient-to-r from-[#9b87f5] to-[#C72C41] hover:from-[#8B5CF6] hover:to-[#D946EF]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Summarize as PRD (ChatGPT)'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="prd" className="text-sm font-medium">Generated PRD</label>
                  <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
                <Textarea
                  id="prd"
                  value={prdSummary}
                  onChange={(e) => setPrdSummary(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
            </div>
          )}
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isGenerating}>Cancel</AlertDialogCancel>
          {prdSummary && (
            <AlertDialogAction 
              onClick={handleDialogClose}
              className="bg-gradient-to-r from-[#9b87f5] to-[#C72C41] hover:from-[#8B5CF6] hover:to-[#D946EF]"
            >
              Done
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default JiraTicketDialog;
