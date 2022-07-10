import * as moment from "moment";

export class FormatUtil {
    public static formatDate(isoDate: string): string {
      return moment(isoDate).format('HH:mm:ss - DD.MM.YYYY');
    }

    public static escape(str: string, search: string): string {
      return str?.replaceAll(search, encodeURI(search));
    }
    
    public static unescape(str: string, search: string): string {
      return str?.replaceAll(encodeURI(search), search);
    }
}