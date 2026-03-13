export class StudySession {
  static async create(data: any) {
    console.log("Creating study session:", data);
    const sessions = JSON.parse(localStorage.getItem('study_sessions') || '[]');
    sessions.push({ ...data, id: Date.now(), created_date: new Date().toISOString() });
    localStorage.setItem('study_sessions', JSON.stringify(sessions));
    return sessions[sessions.length - 1];
  }

  static async filter(query: any, sort: string = '') {
    const sessions = JSON.parse(localStorage.getItem('study_sessions') || '[]');
    let filtered = sessions;
    if (query.date) {
      filtered = filtered.filter((s: any) => s.date === query.date);
    }
    if (sort === '-created_date') {
      filtered.sort((a: any, b: any) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
    }
    return filtered;
  }
}
