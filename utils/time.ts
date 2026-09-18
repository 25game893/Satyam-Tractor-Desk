
export const getCountdownToReopen = (closedAt: string): string => {
  const closedDate = new Date(closedAt);
  const now = new Date();
  
  // Reopen time: Next day at 10:00 AM
  const reopenTime = new Date(closedDate);
  reopenTime.setDate(reopenTime.getDate() + 1);
  reopenTime.setHours(10, 0, 0, 0);
  
  const diff = reopenTime.getTime() - now.getTime();
  
  if (diff <= 0) return "00:00:00";
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
