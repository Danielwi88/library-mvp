import dayjs from "dayjs";
import { Card, CardContent } from "@/components/ui/card";

export function ReviewCard({ name, rating, comment, createdAt }: { name: string; rating: number; comment?: string; createdAt: string; }) {
  return (
    <Card className="mb-2">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="font-medium">{name}</div>
          <div className="text-sm text-muted-foreground">{dayjs(createdAt).format("D MMM YYYY, HH:mm")}</div>
        </div>
        <div className="text-sm">⭐ {rating}/5</div>
        {comment && <p className="text-sm mt-1">{comment}</p>}
      </CardContent>
    </Card>
  );
}