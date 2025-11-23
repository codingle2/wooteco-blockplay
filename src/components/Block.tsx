import type { Block } from "@/Global/types"

export const BlockComponent: React.FC<{ 
    block: Block; onRemove?: (id: string) => void; isDraggable?: boolean; 
    onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void; onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void; 
    onArgChange?: (blockId: string, argIndex: number, newValue: string | number) => void;
    registeredCarNames?: string[];
}> = ({ block, onRemove, isDraggable = false, onDragStart, onDragEnd, onArgChange, registeredCarNames = [] }) => {
    const { id, label, color, args, metadata } = block;

    const handleClick = onRemove ? () => onRemove(id) : undefined;
    
    const renderArgument = (argValue: string | number, argIndex: number) => {
        if (!metadata || !metadata[argIndex] || !onArgChange || isDraggable) {
            return null; 
        }

        const argMeta = metadata[argIndex].split(':');
        const type = argMeta[0];
        const options = argMeta.length > 1 ? argMeta[1].split(',') : [];

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const value = type === 'number' ? Number(e.target.value) : e.target.value;
            onArgChange(id, argIndex, value);
        };
        
        const baseInputClasses = "bg-white text-gray-800 p-1 rounded-md text-xs font-normal border-none focus:ring-2 focus:ring-indigo-500 w-24";
        
        switch (type) {
            case 'number':
                return <input key={argIndex} type="number" value={String(argValue)} onChange={handleChange} className={baseInputClasses} onClick={(e) => e.stopPropagation()} />;
            case 'text':
                return <input key={argIndex} type="text" value={String(argValue)} onChange={handleChange} className={baseInputClasses} placeholder={argValue as string} onClick={(e) => e.stopPropagation()} />;
            case 'select':
                let selectOptions = options;
                let currentValue = String(argValue);
                if (options[0] === 'dynamic') {
                    if (registeredCarNames.length > 0) {
                        selectOptions = registeredCarNames;
                        if (currentValue === '선수 이름' || !registeredCarNames.includes(currentValue)) {
                            currentValue = registeredCarNames[0];
                        }
                    } else {
                        selectOptions = ['차량 없음'];
                        currentValue = '차량 없음';
                    }
                }
                
                return (
                    <select key={argIndex} value={currentValue} onChange={handleChange} className={baseInputClasses} onClick={(e) => e.stopPropagation()}>
                        {selectOptions.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                );
            default:
                 return (
                    <span key={argIndex} className="ml-2 px-2 py-0.5 bg-white bg-opacity-30 rounded-md truncate max-w-[150px]">
                        {argValue}
                    </span>
                );
        }
    };


    return (
        <div
            className={`flex items-center p-3 m-1 text-white text-sm font-semibold rounded-lg shadow-md transition-transform ${
                onRemove ? 'cursor-pointer hover:scale-[1.01]' : (isDraggable ? 'cursor-grab' : 'cursor-default')
            }`}
            style={{ backgroundColor: color }}
            draggable={isDraggable}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onClick={handleClick}
        >
            <span className="flex-shrink-0">{label}</span>
            {args.map((arg, index) => (
                <div key={index} className="ml-2">
                    {renderArgument(arg, index)}
                </div>
            ))}
            {onRemove && <span className="ml-2 text-xs opacity-70">❌</span>}
        </div>
    );
};