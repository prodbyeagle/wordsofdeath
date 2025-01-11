import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Clock } from "lucide-react";

interface TimeStampProps {
    timestamp: string;
    className?: string;
    showIcon?: boolean;
    extended?: boolean;
    text?: string;
}

export const TimeStamp = ({
    timestamp,
    className,
    showIcon = true,
    extended = false,
    text
}: TimeStampProps) => {
    return (
        <time
            dateTime={timestamp}
            className={`flex items-center gap-1 text-sm text-neutral-400 ${className}`}
        >
            {showIcon && <Clock className="w-3.5 h-3.5" />}
            {formatDistanceToNow(new Date(timestamp), {
                includeSeconds: true,
                addSuffix: true,
                locale: de
            })}
            {extended && text && (
                <span className="text-sm text-neutral-400">{text}</span>
            )}
        </time>
    );
};
