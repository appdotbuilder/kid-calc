import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Calculation, CalculationOperation, PerformCalculationInput } from '../../server/src/schema';
import './App.css';

function App() {
  // Calculator state
  const [display, setDisplay] = useState<string>('0');
  const [firstNumber, setFirstNumber] = useState<number | null>(null);
  const [operation, setOperation] = useState<CalculationOperation | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showResultAnimation, setShowResultAnimation] = useState<boolean>(false);
  const [showCongrats, setShowCongrats] = useState<boolean>(false);
  
  // History state
  const [history, setHistory] = useState<Calculation[]>([]);

  // Load calculation history
  const loadHistory = useCallback(async () => {
    try {
      const result = await trpc.getCalculationHistory.query();
      setHistory(result);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Handle number input
  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  // Handle decimal point
  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  // Clear calculator
  const clear = () => {
    setDisplay('0');
    setFirstNumber(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  // Handle operation input
  const performOperation = (nextOperation: CalculationOperation) => {
    const inputValue = parseFloat(display);

    if (firstNumber === null) {
      setFirstNumber(inputValue);
    } else if (operation) {
      calculate();
      return;
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  // Calculate result
  const calculate = async () => {
    if (firstNumber === null || operation === null) return;

    const inputValue = parseFloat(display);
    setIsLoading(true);

    try {
      const calculationInput: PerformCalculationInput = {
        first_number: firstNumber,
        second_number: inputValue,
        operation: operation
      };

      const result = await trpc.performCalculation.mutate(calculationInput);
      
      setDisplay(result.result.toString());
      setShowResultAnimation(true);
      setShowCongrats(true);
      setFirstNumber(null);
      setOperation(null);
      setWaitingForOperand(true);
      
      // Add to history
      setHistory(prev => [result.calculation, ...prev]);
      
      // Reset animation after delay
      setTimeout(() => {
        setShowResultAnimation(false);
        setShowCongrats(false);
      }, 2000);
    } catch (error) {
      console.error('Calculation error:', error);
      // Kid-friendly error messages
      if (error instanceof Error && error.message.includes('divide by zero')) {
        setDisplay('Oops! 🤔');
        setTimeout(() => {
          setDisplay('Can\'t ÷ by 0');
          setTimeout(() => clear(), 2000);
        }, 1000);
      } else {
        setDisplay('Hmm... 🤨');
        setTimeout(() => clear(), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Clear history
  const clearHistory = async () => {
    try {
      await trpc.clearCalculationHistory.mutate();
      setHistory([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  // Get operation symbol for display
  const getOperationSymbol = (op: CalculationOperation): string => {
    switch (op) {
      case 'add': return '+';
      case 'subtract': return '−';
      case 'multiply': return '×';
      case 'divide': return '÷';
      default: return '';
    }
  };

  // Get encouraging message based on number of calculations
  const getEncouragementMessage = (): string => {
    const count = history.length;
    if (count === 0) return "Ready to start calculating? 🚀";
    if (count < 5) return `${count} calculation${count === 1 ? '' : 's'} done! Keep going! 💪`;
    if (count < 10) return `Wow! ${count} calculations! You're on fire! 🔥`;
    if (count < 20) return `Amazing! ${count} calculations! Math genius! 🧠`;
    return `Incredible! ${count}+ calculations! You're a math superstar! ⭐`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
      {/* Congratulations Message */}
      {showCongrats && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-2xl font-bold px-8 py-4 rounded-full shadow-2xl animate-bounce border-4 border-white">
            🌟 Great job! 🌟
          </div>
        </div>
      )}
      
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-4">🧮 Kids Calculator 🌟</h1>
          <p className="text-2xl text-white/90">Have fun with numbers!</p>
        </div>

        {/* Instructions Panel */}
        <Card className="bg-white/90 backdrop-blur-sm border-4 border-cyan-400 shadow-xl mb-8">
          <CardHeader className="bg-gradient-to-r from-cyan-400 to-teal-500 text-center">
            <CardTitle className="text-2xl font-bold text-white">📚 How to Use Your Calculator</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <div className="text-2xl mb-2">🔢</div>
                <p className="text-sm font-semibold">Click numbers</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <div className="text-2xl mb-2">➕</div>
                <p className="text-sm font-semibold">Choose operation</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <div className="text-2xl mb-2">✨</div>
                <p className="text-sm font-semibold">Press equals</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <div className="text-2xl mb-2">📊</div>
                <p className="text-sm font-semibold">See your work</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Calculator */}
          <Card className="bg-white/95 backdrop-blur-sm border-4 border-yellow-400 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-400 text-center">
              <CardTitle className="text-3xl font-bold text-white">Calculator</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Display */}
              <div className={`bg-black text-white text-right text-4xl font-mono p-6 rounded-lg mb-6 border-4 border-blue-400 min-h-[80px] flex items-center justify-end ${showResultAnimation ? 'animate-pulse' : ''}`}>
                {isLoading ? '⏳ Calculating...' : display}
              </div>

              {/* Buttons Grid */}
              <div className="grid grid-cols-4 gap-3">
                {/* Row 1 */}
                <Button
                  onClick={clear}
                  className="h-16 text-2xl font-bold bg-red-500 hover:bg-red-600 text-white col-span-2 transition-transform hover:scale-105"
                >
                  Clear 🗑️
                </Button>
                <Button
                  disabled
                  className="h-16 text-2xl bg-gray-300 text-gray-500 cursor-not-allowed"
                >
                  ±
                </Button>
                <Button
                  onClick={() => performOperation('divide')}
                  className="h-16 text-2xl font-bold bg-blue-500 hover:bg-blue-600 text-white transition-transform hover:scale-105"
                  disabled={isLoading}
                >
                  ÷
                </Button>

                {/* Row 2 */}
                <Button
                  onClick={() => inputNumber('7')}
                  className="h-16 text-2xl font-bold bg-green-500 hover:bg-green-600 text-white transition-transform hover:scale-105"
                  disabled={isLoading}
                >
                  7
                </Button>
                <Button
                  onClick={() => inputNumber('8')}
                  className="h-16 text-2xl font-bold bg-green-500 hover:bg-green-600 text-white transition-transform hover:scale-105"
                  disabled={isLoading}
                >
                  8
                </Button>
                <Button
                  onClick={() => inputNumber('9')}
                  className="h-16 text-2xl font-bold bg-green-500 hover:bg-green-600 text-white transition-transform hover:scale-105"
                  disabled={isLoading}
                >
                  9
                </Button>
                <Button
                  onClick={() => performOperation('multiply')}
                  className="h-16 text-2xl font-bold bg-blue-500 hover:bg-blue-600 text-white transition-transform hover:scale-105"
                  disabled={isLoading}
                >
                  ×
                </Button>

                {/* Row 3 */}
                <Button
                  onClick={() => inputNumber('4')}
                  className="h-16 text-2xl font-bold bg-green-500 hover:bg-green-600 text-white transition-transform hover:scale-105"
                  disabled={isLoading}
                >
                  4
                </Button>
                <Button
                  onClick={() => inputNumber('5')}
                  className="h-16 text-2xl font-bold bg-green-500 hover:bg-green-600 text-white transition-transform hover:scale-105"
                  disabled={isLoading}
                >
                  5
                </Button>
                <Button
                  onClick={() => inputNumber('6')}
                  className="h-16 text-2xl font-bold bg-green-500 hover:bg-green-600 text-white transition-transform hover:scale-105"
                  disabled={isLoading}
                >
                  6
                </Button>
                <Button
                  onClick={() => performOperation('subtract')}
                  className="h-16 text-2xl font-bold bg-blue-500 hover:bg-blue-600 text-white transition-transform hover:scale-105"
                  disabled={isLoading}
                >
                  −
                </Button>

                {/* Row 4 */}
                <Button
                  onClick={() => inputNumber('1')}
                  className="h-16 text-2xl font-bold bg-green-500 hover:bg-green-600 text-white transition-transform hover:scale-105"
                  disabled={isLoading}
                >
                  1
                </Button>
                <Button
                  onClick={() => inputNumber('2')}
                  className="h-16 text-2xl font-bold bg-green-500 hover:bg-green-600 text-white transition-transform hover:scale-105"
                  disabled={isLoading}
                >
                  2
                </Button>
                <Button
                  onClick={() => inputNumber('3')}
                  className="h-16 text-2xl font-bold bg-green-500 hover:bg-green-600 text-white transition-transform hover:scale-105"
                  disabled={isLoading}
                >
                  3
                </Button>
                <Button
                  onClick={() => performOperation('add')}
                  className="h-16 text-2xl font-bold bg-blue-500 hover:bg-blue-600 text-white transition-transform hover:scale-105"
                  disabled={isLoading}
                >
                  +
                </Button>

                {/* Row 5 */}
                <Button
                  onClick={() => inputNumber('0')}
                  className="h-16 text-2xl font-bold bg-green-500 hover:bg-green-600 text-white col-span-2 transition-transform hover:scale-105"
                  disabled={isLoading}
                >
                  0
                </Button>
                <Button
                  onClick={inputDecimal}
                  className="h-16 text-2xl font-bold bg-green-500 hover:bg-green-600 text-white transition-transform hover:scale-105"
                  disabled={isLoading}
                >
                  .
                </Button>
                <Button
                  onClick={calculate}
                  className="h-16 text-2xl font-bold bg-orange-500 hover:bg-orange-600 text-white transition-transform hover:scale-105"
                  disabled={isLoading || firstNumber === null || operation === null}
                >
                  = ✨
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* History Panel */}
          <Card className="bg-white/95 backdrop-blur-sm border-4 border-green-400 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-green-400 to-blue-500 text-center">
              <CardTitle className="text-3xl font-bold text-white flex flex-col items-center gap-2">
                📊 Your Calculations
                {history.length > 0 && (
                  <Button
                    onClick={clearHistory}
                    variant="outline"
                    size="sm"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  >
                    Clear All 🧹
                  </Button>
                )}
              </CardTitle>
              <p className="text-lg text-white/90 mt-2">{getEncouragementMessage()}</p>
            </CardHeader>
            <CardContent className="p-6">
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎯</div>
                  <p className="text-xl text-gray-600 mb-2">No calculations yet!</p>
                  <p className="text-lg text-gray-500">Start calculating to see your work here!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {history.map((calc: Calculation) => (
                    <div key={calc.id} className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg border-2 border-purple-200">
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-mono font-bold text-purple-800">
                          {calc.first_number} {getOperationSymbol(calc.operation)} {calc.second_number} = {calc.result}
                        </div>
                        <Badge 
                          variant="secondary" 
                          className="bg-yellow-200 text-yellow-800 text-sm"
                        >
                          {calc.operation}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        📅 {calc.created_at.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Fun Footer */}
        <div className="text-center mt-8">
          <p className="text-white text-xl">Keep practicing! You're doing great! 🌟⭐✨</p>
          <div className="flex justify-center gap-4 mt-4">
            <div className="text-4xl animate-bounce" style={{ animationDelay: '0s' }}>🎯</div>
            <div className="text-4xl animate-bounce" style={{ animationDelay: '0.1s' }}>🎨</div>
            <div className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎪</div>
            <div className="text-4xl animate-bounce" style={{ animationDelay: '0.3s' }}>🎈</div>
            <div className="text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>🎊</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;