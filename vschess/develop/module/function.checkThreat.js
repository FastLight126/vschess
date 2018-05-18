// 将军检查器
vs.checkThreat = function(situation){
	situation = situation.slice(0);
	var kingIndex = 199;
	var player = situation[0];
	var enermy = 3 - player;

	// 寻找帅、将
	if (player == 1) {
		for (var i=0;i<9;++i) {
			if (situation[vs.castleR[i]] == 21) {
				kingIndex = vs.castleR[i];
				break;
			}
		}
	}
	else {
		for (var i=0;i<9;++i) {
			if (situation[vs.castleB[i]] == 37) {
				kingIndex = vs.castleB[i];
				break;
			}
		}
	}

	// 车、将、帅
	for (var i=kingIndex+1;situation[i];++i) {
		if (situation[i] > 1) {
			if ((situation[i] & 15) == 1 && situation[i] >> 4 == enermy) {
				return true;
			}

			break;
		}
	}

	for (var i=kingIndex-1;situation[i];--i) {
		if (situation[i] > 1) {
			if ((situation[i] & 15) == 1 && situation[i] >> 4 == enermy) {
				return true;
			}

			break;
		}
	}

	for (var i=kingIndex+16;situation[i];i+=16) {
		if (situation[i] > 1) {
			if (((situation[i] & 15) == 1 || (situation[i] & 15) == 5) && situation[i] >> 4 == enermy) {
				return true;
			}

			break;
		}
	}

	for (var i=kingIndex-16;situation[i];i-=16) {
		if (situation[i] > 1) {
			if (((situation[i] & 15) == 1 || (situation[i] & 15) == 5) && situation[i] >> 4 == enermy) {
				return true;
			}

			break;
		}
	}

	// 马
	for (var i=0;i<4;++i) {
		if (situation[kingIndex + vs.advisorDelta[i]] == 1) {
			var piece = situation[kingIndex + vs.knightCheckDelta[i][0]];

			if ((piece & 15) == 2 && piece >> 4 == enermy) {
				return true;
			}

			var piece = situation[kingIndex + vs.knightCheckDelta[i][1]];

			if ((piece & 15) == 2 && piece >> 4 == enermy) {
				return true;
			}
		}
	}

	// 炮
	var barbette = false;

	for (var i=kingIndex+1;situation[i];++i) {
		if (barbette) {
			if (situation[i] > 1) {
				if ((situation[i] & 15) == 6 && situation[i] >> 4 == enermy) {
					return true;
				}

				break;
			}
		}
		else {
			if (situation[i] > 1) {
				barbette = true;
			}
		}
	}

	var barbette = false;

	for (var i=kingIndex-1;situation[i];--i) {
		if (barbette) {
			if (situation[i] > 1) {
				if ((situation[i] & 15) == 6 && situation[i] >> 4 == enermy) {
					return true;
				}

				break;
			}
		}
		else {
			if (situation[i] > 1) {
				barbette = true;
			}
		}
	}

	var barbette = false;

	for (var i=kingIndex+16;situation[i];i+=16) {
		if (barbette) {
			if (situation[i] > 1) {
				if ((situation[i] & 15) == 6 && situation[i] >> 4 == enermy) {
					return true;
				}

				break;
			}
		}
		else {
			if (situation[i] > 1) {
				barbette = true;
			}
		}
	}

	var barbette = false;

	for (var i=kingIndex-16;situation[i];i-=16) {
		if (barbette) {
			if (situation[i] > 1) {
				if ((situation[i] & 15) == 6 && situation[i] >> 4 == enermy) {
					return true;
				}

				break;
			}
		}
		else {
			if (situation[i] > 1) {
				barbette = true;
			}
		}
	}

	// 兵、卒
	if ((situation[kingIndex + 1] & 15) == 7 && situation[kingIndex + 1] >> 4 == enermy) {
		return true;
	}

	if ((situation[kingIndex - 1] & 15) == 7 && situation[kingIndex - 1] >> 4 == enermy) {
		return true;
	}

	if (player == 1) {
		if ((situation[kingIndex - 16] & 15) == 7 && situation[kingIndex - 16] >> 4 == 2) {
			return true;
		}
	}
	else {
		if ((situation[kingIndex + 16] & 15) == 7 && situation[kingIndex + 16] >> 4 == 1) {
			return true;
		}
	}

	return false;
};
