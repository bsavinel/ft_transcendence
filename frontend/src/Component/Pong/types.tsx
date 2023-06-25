export type Position = {
	x: number;
	y: number;
  };
  
  export type Direction = {
	x: number;
	y: number;
  };
  
  export interface Spell {
	name: string;
	type: number;
	effect_player: string;
	effect_ball: string;
	speed: number;
	color: string;
  };
  