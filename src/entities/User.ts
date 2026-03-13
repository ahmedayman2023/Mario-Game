export class User {
  static async getMyUserData() {
    return JSON.parse(localStorage.getItem('current_user') || '{"current_study_topic": ""}');
  }

  static async updateMyUserData(data: any) {
    const user = await this.getMyUserData();
    const updated = { ...user, ...data };
    localStorage.setItem('current_user', JSON.stringify(updated));
    return updated;
  }
}
