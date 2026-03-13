export class User {
  static async me() {
    return JSON.parse(localStorage.getItem('current_user') || '{"current_study_topic": ""}');
  }

  static async updateMyUserData(data: any) {
    const user = await this.me();
    const updated = { ...user, ...data };
    localStorage.setItem('current_user', JSON.stringify(updated));
    return updated;
  }
}
