import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { ChevronDown, FileText, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import JiraTicketDialog, { CardData } from "@/components/JiraTicketDialog";

const Dashboard = () => {
  // Sample data - in a real app, this would come from the backend
  const categoryData = [
    { name: "WIS", value: 4 },
    { name: "ETS", value: 2 },
    { name: "MIS ONE", value: 3 },
    { name: "Sales", value: 1 },
    { name: "Support", value: 1 },
    { name: "Tech", value: 2 },
  ];
  
  const COLORS = ["#C72C41", "#FF8042", "#00C49F", "#0088FE", "#8884d8", "#82ca9d"];
  
  // Enhanced card data with suggestions and response counts
  const cardsWithSuggestions = [
    {
      id: "card-1",
      content: "I believe pineapple belongs on pizza",
      category: "WIS",
      approvedCount: 67,
      rejectedCount: 34,
      suggestions: [
        { id: "s1", suggestion: "It depends on the pizza type", date: "2 days ago", author: "John Doe" },
        { id: "s2", suggestion: "Try adding ham with pineapple", date: "3 days ago", author: "Maria Garcia" },
        { id: "s3", suggestion: "Consider different cheese combinations", date: "4 days ago", author: "Alex Johnson" }
      ]
    },
    {
      id: "card-2",
      content: "I enjoy going to museums on weekends",
      category: "ETS",
      approvedCount: 45,
      rejectedCount: 12,
      suggestions: [
        { id: "s4", suggestion: "Try art galleries too", date: "5 days ago", author: "Emily Wilson" },
        { id: "s5", suggestion: "Check out special night exhibitions", date: "6 days ago", author: "Sam Taylor" }
      ]
    },
    {
      id: "card-3",
      content: "I think cats are better than dogs",
      category: "MIS ONE",
      approvedCount: 89,
      rejectedCount: 76,
      suggestions: [
        { id: "s6", suggestion: "Both have their own charms", date: "1 week ago", author: "Jamie Rivera" },
        { id: "s7", suggestion: "Consider personality traits over species", date: "8 days ago", author: "Pat Chen" },
        { id: "s8", suggestion: "Depends on living arrangements", date: "9 days ago", author: "Taylor Morris" }
      ]
    },
    {
      id: "card-4",
      content: "We should implement dark mode in our app",
      category: "Tech",
      approvedCount: 102,
      rejectedCount: 14,
      suggestions: [
        { id: "s9", suggestion: "Consider using a theme toggle", date: "3 days ago", author: "Chris Lee" },
        { id: "s10", suggestion: "Use system preferences to set initial mode", date: "4 days ago", author: "Morgan Shaw" }
      ]
    },
    {
      id: "card-5",
      content: "Our sales strategy needs improvement",
      category: "Sales",
      approvedCount: 56,
      rejectedCount: 8,
      suggestions: [
        { id: "s11", suggestion: "Focus more on customer retention", date: "4 days ago", author: "Jordan Blake" }
      ]
    },
    {
      id: "card-6",
      content: "Customer support response time is too long",
      category: "Support",
      approvedCount: 78,
      rejectedCount: 23,
      suggestions: [
        { id: "s12", suggestion: "Add automated initial responses", date: "2 days ago", author: "Casey Thompson" }
      ]
    },
  ];

  const [cards, setCards] = useState(cardsWithSuggestions);
  const [isJiraDialogOpen, setIsJiraDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);

  // Function to handle creating a JIRA ticket
  const openJiraTicketDialog = (card: any) => {
    setSelectedCard(card);
    setIsJiraDialogOpen(true);
  };

  // Function to handle card updates
  const handleCardUpdate = (cardId: string, updates: Partial<CardData>) => {
    setCards(prevCards => 
      prevCards.map(card => 
        card.id === cardId ? { ...card, ...updates } : card
      )
    );
  };

  return (
    <div className="pb-24 bg-[#2D142C] min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-[#C72C41]">Dashboard</span>
          </h1>
          <p className="text-white mt-2">Insights and activity</p>
        </header>
        
        <Tabs defaultValue="overview" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cardsummary">Card Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Card Categories</CardTitle>
                <CardDescription>Distribution of cards by category</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="cardsummary" className="space-y-6">
            <div className="grid gap-6">
              {cards.map((card) => (
                <Card key={card.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{card.content}</CardTitle>
                        <CardDescription className="mt-1">Category: {card.category}</CardDescription>
                      </div>
                      <Badge className="bg-[#C72C41] text-white">{card.suggestions.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 mb-4">
                      <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        <ThumbsUp className="h-4 w-4" />
                        <span className="font-medium">{card.approvedCount}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full">
                        <ThumbsDown className="h-4 w-4" />
                        <span className="font-medium">{card.rejectedCount}</span>
                      </div>
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value={card.id}>
                        <AccordionTrigger className="text-sm font-medium">
                          View {card.suggestions.length} suggestions
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            {card.suggestions.map((suggestion) => (
                              <div key={suggestion.id} className="border-b pb-4 last:border-0">
                                <div className="font-medium text-sm">{suggestion.suggestion}</div>
                                <div className="flex justify-between items-center mt-1">
                                  <div className="text-xs text-muted-foreground">By: {suggestion.author}</div>
                                  <div className="text-xs text-muted-foreground">{suggestion.date}</div>
                                </div>
                              </div>
                            ))}
                            <div className="pt-4 flex justify-end">
                              <Button 
                                variant="outline"
                                className="flex items-center gap-2 text-sm bg-gradient-to-r from-[#9b87f5] to-[#C72C41] text-white hover:from-[#8B5CF6] hover:to-[#D946EF] border-none"
                                onClick={() => openJiraTicketDialog(card)}
                              >
                                <FileText className="h-4 w-4" />
                                Summarize
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* JIRA Ticket Dialog */}
      {selectedCard && (
        <JiraTicketDialog 
          isOpen={isJiraDialogOpen}
          setIsOpen={setIsJiraDialogOpen}
          cardData={selectedCard}
          onUpdateCard={handleCardUpdate}
        />
      )}
    </div>
  );
};

export default Dashboard;
