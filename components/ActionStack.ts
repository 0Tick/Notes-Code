export class ActionStack {
  private current: Action | null = null;
  private maxActions: number = 10;
  public state: any;
  private first: Action | null = null;

  constructor(maxActions: number = 10, state: any) {
    this.maxActions = maxActions;
    this.state = state;
  }

  addAction(action: Action): void {
    if (this.current === null) {
      this.current = action;
      this.first = action;
    } else {
      this.current.next = action;
      action.prev = this.current;
      this.current = action;
    }
    action.execute(this.state);
  }
  undo(): void {
    if (this.current === undefined || this.current === null) {
      return;
    } else {
      this.current.rollback(this.state);
      this.current = this.current.prev;
    }
  }
  redo(): void {
    if (this.current === undefined || this.current === null) {
      if (this.first !== undefined && this.first !== null) {
        this.current = this.first;
        this.current.execute(this.state);
      }
      return;
    } else if (this.current.next === null) {
      return;
    } else {
      this.current.next.execute(this.state);
      this.current = this.current.next;
    }
  }
  canUndo(): boolean {
    return this.current !== null;
  }
  canRedo(): boolean {
    return (this.current !== null && this.current.next !== null) || (this.current === null && this.first !== null);
  }
}

export interface Action {
  type: string;
  payload: any;
  execute: (state: any) => void;
  rollback: (state: any) => void;
  next: Action | null;
  prev: Action | null;
}
