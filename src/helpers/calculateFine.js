export const calculateFine = (dueDate, returnDate) => {
    const lateDays = Math.ceil(
      (returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return lateDays > 0 ? lateDays * 10 : 0;
  };
  