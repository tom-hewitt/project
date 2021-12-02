import { project, store } from ".";

export abstract class Command {
  action: string;

  constructor(action: string) {
    this.action = action;
  }
  abstract execute(store: store): void;
  abstract undo(store: store): void;
}
