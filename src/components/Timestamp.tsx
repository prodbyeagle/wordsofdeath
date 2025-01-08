import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Clock } from "lucide-react";

interface TimeStampProps {
    timestamp: string;
}

export const TimeStamp = ({ timestamp }: TimeStampProps) => {
    return (
        <time
            dateTime={timestamp}
            className="flex items-center gap-1.5 text-sm text-zinc-400"
        >
            <Clock className="w-3.5 h-3.5" />
            {formatDistanceToNow(new Date(timestamp), {
                includeSeconds: true,
                addSuffix: true,
                locale: de
            })}
        </time>
    );
};