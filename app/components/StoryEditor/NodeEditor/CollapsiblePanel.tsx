import React, { useState } from 'react';

interface CollapsiblePanelProps {
    title: string;
    children: React.ReactNode;
    rightElement?: React.ReactNode;
    defaultOpen?: boolean;
}

export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
                                                                      title,
                                                                      children,
                                                                      rightElement,
                                                                      defaultOpen = true
                                                                  }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-t border-gray-600 pt-4">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white"
                >
          <span className="text-lg leading-none">
            {isOpen ? '▼' : '▶'}
          </span>
                    {title}
                </button>
                {rightElement}
            </div>
            {isOpen && <div className="space-y-4">{children}</div>}
        </div>
    );
};