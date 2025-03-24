import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat',
  standalone: false
})
export class TimeFormatPipe implements PipeTransform {

  transform(value: string): string {
    // Check if the input is a valid time in HH:mm:ss format
    if (!value) return '';

    const [hours, minutes, seconds] = value.split(':').map(Number);

    // Convert from 24-hour to 12-hour format
    let ampm = 'AM';
    let hour12 = hours;

    if (hour12 >= 12) {
      ampm = 'PM';
      if (hour12 > 12) hour12 -= 12; // Convert hours > 12 to 12-hour format
    }

    if (hour12 === 0) hour12 = 12; // Convert hour 0 to 12 (midnight)

    // Format the time as 12-hour time
    const formattedTime = `${hour12}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
    return formattedTime;
  }

}
