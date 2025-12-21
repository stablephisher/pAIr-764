import React, { useEffect, useState } from 'react';
import { Scan, FileText, Server, BrainCircuit } from 'lucide-react';

export default function ProcessingEngine() {
    const [step, setStep] = useState(0);
    const steps = [
        { text: "Ingesting Document...", icon: FileText },
        { text: "Extracting Legal Text...", icon: Scan },
        { text: "AI Analysis in Progress...", icon: BrainCircuit },
        { text: "Structuring Intelligence...", icon: Server }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setStep(s => (s < steps.length - 1 ? s + 1 : s));
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    const CurrentIcon = steps[step].icon;

    return (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                <div className="relative bg-surface p-6 rounded-full border border-blue-500/30">
                    <CurrentIcon size={48} className="text-blue-400 animate-bounce" />
                </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{steps[step].text}</h2>
            <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mt-4">
                <div
                    className="h-full bg-blue-500 transition-all duration-500 ease-out"
                    style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                />
            </div>
            <p className="text-gray-500 text-sm mt-4">Please wait, this may take a moment...</p>
        </div>
    );
}
