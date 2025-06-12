export class ActionStack {
  private actions: Action[];
  private currentIndex: number = -1;
  private maxActions: number = 10;
  public state: any;

  constructor(maxActions: number = 10, state: any) {
    this.maxActions = maxActions;
    this.state = state;
    this.actions = [];
  }

  addAction(action: Action): void {
    if (this.actions.length === 0) {
      this.actions.push(action);
      this.currentIndex = 1;
    } else {
      this.actions.length = this.currentIndex>=0?this.currentIndex:0;
      this.actions.push(action);
      if (this.actions.length > this.maxActions) {
        this.actions.shift();
      }
      this.currentIndex = this.actions.length;
    }
    action.execute(this.state);
  }
  undo(): void {
    if (this.currentIndex === -1) {
      return;
    } else if (this.currentIndex === this.actions.length) {
      this.currentIndex--;
    }
    this.actions[this.currentIndex].rollback(this.state);
    this.currentIndex--;
  }
  redo(): void {
    if (
      this.currentIndex === 0 ||
      this.actions.length == 0 ||
      this.currentIndex === this.actions.length
    ) {
      return;
    } else if (this.currentIndex === -1 || this.actions.length === 1) {
      this.actions[0].execute(this.state);
      this.currentIndex = 1;
    } else {
      this.actions[this.currentIndex].execute(this.state);
      this.currentIndex++;
    }
  }
}

export interface Action {
  type: string;
  payload: any;
  execute: (state: any) => void;
  rollback: (state: any) => void;
}
