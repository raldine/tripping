import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: false
})
export class DateFormatPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return '';

    const date = new Date(value);
    if (isNaN(date.getTime())) return value; // Return original string if invalid

    // Get day, month, and short day of the week (e.g., "Wed")
    const day = date.getDate(); // 27
    const month = date.getMonth() + 1; // 3 (March)
    const dayOfWeek = date.toLocaleDateString('en-GB', { weekday: 'short' }); // "Thu"

    return `${day}/${month} (${dayOfWeek})`;
  }
}
