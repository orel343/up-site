'use client'

import { useTheme } from "next-themes"

interface ActivitySquare {
  date: string;
  count: number;
}

function generateMockActivity(): ActivitySquare[] {
  const activity: ActivitySquare[] = [];
  const today = new Date();
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    activity.unshift({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 5)
    });
  }
  
  return activity;
}

export function ActivityGraph() {
  const activity = generateMockActivity();

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-full p-4">
        <div className="flex flex-wrap gap-1">
          {activity.map((day) => (
            <div
              key={day.date}
              className={`w-3 h-3 rounded-sm transition-colors ${
                day.count === 0
                  ? 'bg-muted'
                  : day.count === 1
                  ? 'bg-primary/30'
                  : day.count === 2
                  ? 'bg-primary/50'
                  : day.count === 3
                  ? 'bg-primary/70'
                  : 'bg-primary'
              }`}
              title={`${day.date}: ${day.count} activities`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
