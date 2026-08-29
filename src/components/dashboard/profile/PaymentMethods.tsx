
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { CreditCard, Trash2, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '../ui/dialog';

type PaymentCard = {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
};

const PaymentMethods = () => {
  const [cards, setCards] = useState<PaymentCard[]>([
    {
      id: '1',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: '12',
      expiryYear: '2025',
      isDefault: true
    }
  ]);
  
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCard, setNewCard] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: ''
  });
  
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  
  const handleAddCard = () => {
    // In a real app, you would validate and process card information
    // For this demo, we'll just add a mock card
    const newCardObj: PaymentCard = {
      id: Math.random().toString(36).substr(2, 9),
      last4: newCard.number.slice(-4) || '1234',
      brand: 'Mastercard',
      expiryMonth: newCard.expiry.split('/')[0] || '01',
      expiryYear: newCard.expiry.split('/')[1] || '2026',
      isDefault: cards.length === 0
    };
    
    setCards([...cards, newCardObj]);
    setNewCard({ number: '', name: '', expiry: '', cvc: '' });
    setIsAddingCard(false);
    toast.success('New payment method added');
  };
  
  const confirmDeleteCard = (cardId: string) => {
    setCardToDelete(cardId);
  };
  
  const handleDeleteCard = () => {
    if (cardToDelete) {
      setCards(cards.filter(card => card.id !== cardToDelete));
      setCardToDelete(null);
      toast.success('Payment method removed');
    }
  };
  
  const setDefaultCard = (cardId: string) => {
    setCards(cards.map(card => ({
      ...card,
      isDefault: card.id === cardId
    })));
    toast.success('Default payment method updated');
  };
  
  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return '💳 Visa';
      case 'mastercard':
        return '💳 Mastercard';
      case 'amex':
        return '💳 Amex';
      default:
        return '💳 Card';
    }
  };
  
  return (
    <div>
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold border-b border-border pb-4">Payment Methods</h2>
        
        <Card className="bg-secondary/30 border-border">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Your Payment Methods</h3>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setIsAddingCard(true)}
              >
                <Plus className="h-4 w-4" />
                Add New Card
              </Button>
            </div>
            
            {cards.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No payment methods added yet</p>
                <Button 
                  variant="default" 
                  className="mt-4"
                  onClick={() => setIsAddingCard(true)}
                >
                  Add Payment Method
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cards.map(card => (
                  <div 
                    key={card.id} 
                    className={`p-4 rounded-lg flex items-center justify-between ${
                      card.isDefault ? 'bg-[#C4FE01]/10 border border-[#C4FE01]/30' : 'bg-background/50 border border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{getCardIcon(card.brand)} •••• {card.last4}</p>
                          {card.isDefault && (
                            <span className="text-xs bg-[#C4FE01]/20 text-[#C4FE01] px-2 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Expires {card.expiryMonth}/{card.expiryYear}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!card.isDefault && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setDefaultCard(card.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => confirmDeleteCard(card.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center p-4 border border-border rounded-lg bg-background/20">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                A temporary $0.50 verification charge may appear on your card. This amount will be refunded automatically.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Add New Card Dialog */}
      <Dialog open={isAddingCard} onOpenChange={setIsAddingCard}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={newCard.number}
                onChange={(e) => setNewCard({...newCard, number: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                placeholder="John Doe"
                value={newCard.name}
                onChange={(e) => setNewCard({...newCard, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardExpiry">Expiry Date</Label>
                <Input
                  id="cardExpiry"
                  placeholder="MM/YY"
                  value={newCard.expiry}
                  onChange={(e) => setNewCard({...newCard, expiry: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardCvc">CVC</Label>
                <Input
                  id="cardCvc"
                  placeholder="123"
                  value={newCard.cvc}
                  onChange={(e) => setNewCard({...newCard, cvc: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingCard(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCard}>
              Add Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Card Confirmation Dialog */}
      <Dialog open={!!cardToDelete} onOpenChange={(open) => !open && setCardToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Payment Method</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>Are you sure you want to remove this payment method? This action cannot be undone.</p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCardToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCard}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentMethods;
