import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormatDay',
  standalone: false
})
export class DateFormatDayPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return '';

    try {
      const date = typeof value === 'string' ? new Date(value) : value;

      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }

      // Format: "27 March 2025 (Thursday)"
      const day = date.getDate();
      const month = date.toLocaleString('en-GB', { month: 'long' }); // "March"
      const year = date.getFullYear();
      const weekday = date.toLocaleString('en-GB', { weekday: 'long' }); // "Thursday"

      return `${day} ${month} ${year} (${weekday})`;

    } catch (error) {
      console.error('Invalid date format:', value);
      return value; // Return original if parsing fails
    }
  }
}
