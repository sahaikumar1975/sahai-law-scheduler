export function calculateDeadline(startDate: Date, daysAllowed: number): Date {
  let count = 0;
  const currentDate = new Date(startDate);

  while (count < daysAllowed) {
    currentDate.setDate(currentDate.getDate() + 1);
    // 0 is Sunday, 6 is Saturday
    if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
      count++;
    }
  }

  return currentDate;
}

export function getTrafficLightStatus(deadline: Date): "red" | "yellow" | "green" {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(deadline);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "red"; // Overdue
  if (diffDays === 0 || diffDays === 1) return "yellow"; // Due today or tomorrow
  return "green"; // On track
}

export function getDaysRemaining(deadline: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(deadline);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
