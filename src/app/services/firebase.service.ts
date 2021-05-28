import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor(private db: AngularFireDatabase, private http: HttpClient) {}

  get<T>(path: string): Observable<T[]> {
    return this.db
      .list(path)
      .snapshotChanges()
      .pipe(
        map((data: any) => {
          return data.map((d: any) => {
            return {
              key: d.key,
              ...d.payload.val(),
            };
          });
        })
      );
  }
  getByQuery<T>(path: string): Observable<T[]> {
    return this.db
      .list(path, (ref) => {
        const q = ref.limitToLast(4);
        return q;
      })
      .snapshotChanges()
      .pipe(
        map((data: any) => {
          return data.map((d: any) => {
            return {
              key: d.key,
              ...d.payload.val(),
            };
          });
        })
      );
  }
  getByQuery2<T>(path: string): Observable<T[]> {
    return this.db
      .list(path, (ref) => {
        const q = ref.orderByChild('rating').limitToLast(4);
        return q;
      })
      .snapshotChanges()
      .pipe(
        map((data: any) => {
          return data.map((d: any) => {
            return {
              key: d.key,
              ...d.payload.val(),
            };
          });
        })
      );
  }

  getByKey<T>(path: string, key: string): Observable<T> {
    return this.http
      .get<T>(`${environment.firebaseConfig.databaseURL}/${path}/${key}.json`)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  add<T>(path: string, item: T) {
    const projects = this.db.list(path);
    return projects.push(item);
  }
  addObject() {
    this.db.object('unoDeck').set(['adsfsad', 'asdfsdffffff']);
  }
  update(path: string, item: any) {
    const data = JSON.parse(JSON.stringify(item));
    const key = data.key;
    delete data.key;
    return of(this.db.object(path + '/' + key).update(data));
  }

  delete<T>(path: string, item: any) {
    return this.db.object(path + '/' + item.key).remove();
  }
}
