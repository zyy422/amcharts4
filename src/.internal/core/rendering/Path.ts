/**
 * A collection of functions that deals with path calculations.
 */

/**
 * ============================================================================
 * IMPORTS
 * ============================================================================
 * @hidden
 */
import { IPoint } from "../defs/IPoint";
import { IRectangle } from "../defs/IRectangle";
import * as $math from "../utils/Math";
import * as $type from "../utils/Type";
import { getGhostPaper } from "../rendering/Paper";

/**
 * ============================================================================
 * PATH FUNCTIONS
 * ============================================================================
 * @hidden
 */

/**
 * Returns an SVG path from a number of points.
 *
 * @ignore Exclude from docs
 * @param  {IPoint[]}  points  An array of line elbow points
 * @return {string}            SVG path
 */
export function polyline(points: IPoint[]): string {
	let path = lineTo(points[0]);
	let prevPoint = { x: 0, y: 0 };
	for (let i = 0, len = points.length; i < len; i++) {
		let point = points[i];
		if ($math.getDistance(point, prevPoint) > 1) {
			path += lineTo(point);
			prevPoint = point;
		}
	}
	return path;
}


/**
 * Returns a starting point of an SVG path.
 *
 * @ignore Exclude from docs
 * @param  {IPoint}  point  Starting point
 * @return {string}         SVG path
 */
export function moveTo(point: IPoint): string {
	return " M" + $math.round(point.x, 4) + "," + $math.round(point.y, 4) + " ";
}

/**
 * Returns a line part of SVG path.
 *
 * @ignore Exclude from docs
 * @param  {IPoint}  point  SVG path
 * @return {string}         SVG path
 */
export function lineTo(point: IPoint): string {
	return " L" + $math.round(point.x, 4) + "," + $math.round(point.y, 4) + " ";
}

/**
 * Returns a quadratic curve part of an SVG path.
 *
 * @ignore Exclude from docs
 * @param  {IPoint}  point         End point of the curve
 * @param  {IPoint}  controlPoint  Control point
 * @return {string}                SVG path
 */
export function quadraticCurveTo(point: IPoint, controlPoint: IPoint): string {
	return " Q" + $math.round(controlPoint.x, 4)
		+ "," + $math.round(controlPoint.y, 4) + " " + $math.round(point.x, 4)
		+ "," + $math.round(point.y, 4);
}

/**
 * Returns a cubic curve part of an SVG path.
 *
 * @ignore Exclude from docs
 * @param  {IPoint}  point          End point of the curve
 * @param  {IPoint}  controlPointA  Control point A
 * @param  {IPoint}  controlPointB  Control point B
 * @return {string}                 SVG path
 */
export function cubicCurveTo(point: IPoint, controlPointA: IPoint, controlPointB: IPoint): string {
	return " C" + $math.round(controlPointA.x, 4)
		+ "," + $math.round(controlPointA.y, 4) + " " + $math.round(controlPointB.x, 4)
		+ "," + $math.round(controlPointB.y, 4) + " " + $math.round(point.x, 4)
		+ "," + $math.round(point.y, 4);
}

/**
 * Returns a terminator for an SVG path.
 *
 * @ignore Exclude from docs
 * @return {string} SVG path
 */
export function closePath(): string {
	return " Z";
}

/**
 * Returns an arc part of an SVG path.
 *
 * @ignore Exclude from docs
 * @todo Better parameter descriptions
 * @param  {number}  startAngle  Starting angle
 * @param  {number}  arc         Arc
 * @param  {number}  radius      Radius
 * @param  {number}  radiusY     Vertical radius
 * @return {string}              SVG path
 */
export function arcTo(startAngle: number, arc: number, radius: number, radiusY?: number): string {

	if (arc == 0) {
		return "";
	}

	if (!$type.isNumber(radiusY)) {
		radiusY = radius;
	}

	let path = "";
	let c = ",";
	let segments = Math.ceil(Math.abs(arc) / 180);
	let l = 1;

	if (arc < 0) {
		l = 0;
	}

	// previous, as we use a not A
	let pax: number = 0;
	let pay: number = 0;

	// center
	let cx: number = -$math.cos(startAngle) * radius;
	let cy: number = -$math.sin(startAngle) * radiusY;

	// foir very short angles and big radius, solves artefacts
	if (arc < 0.5 && radius > 3000) {
		let endAngle = startAngle + arc
		let ax = $math.round($math.cos(endAngle) * radius, 4);
		let ay = $math.round($math.sin(endAngle) * radiusY, 4);
		return lineTo({ x: ax, y: ay })
	}

	for (let i = 0; i < segments; i++) {
		let endAngle = startAngle + arc / segments * (i + 1);

		let ax = $math.round($math.cos(endAngle) * radius + cx - pax, 4);
		let ay = $math.round($math.sin(endAngle) * radiusY + cy - pay, 4);

		path += " a" + radius + c + radiusY + c + 0 + c + 0 + c + l + c + ax + c + ay;

		pax = ax;
		pay = ay;
	}
	return path;
}

/**
 * Creates an arc path.
 *
 * @ignore Exclude from docs
 * @todo Description
 * @param  {number}  startAngle         [description]
 * @param  {number}  arc                [description]
 * @param  {number}  radius             [description]
 * @param  {number}  innerRadius        [description]
 * @param  {number}  radiusY            [description]
 * @param  {number}  cornerRadius       [description]
 * @param  {number}  innerCornerRadius  [description]
 * @return {string}                     SVG path
 */
export function arc(startAngle: number, arc: number, radius: number, innerRadius?: number, radiusY?: number, cornerRadius?: number, innerCornerRadius?: number): string {
	if (arc == 0) {
		return "";
	}

	if (!$type.isNumber(innerRadius)) {
		innerRadius = 0;
	}

	if (radius == 0 && innerRadius <= 0) {
		return "";
	}

	if (radius < innerRadius) {
		let temp = radius;
		radius = innerRadius;
		innerRadius = temp;

		if ($type.isNumber(radiusY)) {
			radiusY = radiusY / innerRadius * radius;
		}
	}

	arc = $math.min(arc, 360);

	if (arc == 360) {
		cornerRadius = 0;
		innerCornerRadius = 0;
	}

	let endAngle = startAngle + arc;
	let crSin = $math.sin($math.min(arc, 45) / 2);

	radiusY = $type.isNumber(radiusY) ? radiusY : radius;
	cornerRadius = cornerRadius || 0;
	innerCornerRadius = $type.isNumber(innerCornerRadius) ? innerCornerRadius : cornerRadius;

	let innerRadiusY = (radiusY / radius) * innerRadius;

	let cornerRadiusY = (radiusY / radius) * cornerRadius;
	let innerCornerRadiusY = (radiusY / radius) * innerCornerRadius;

	cornerRadius = $math.fitToRange(cornerRadius, 0, (radius - innerRadius) / 2);
	cornerRadiusY = $math.fitToRange(cornerRadiusY, 0, (radiusY - innerRadiusY) / 2);

	innerCornerRadius = $math.fitToRange(innerCornerRadius, 0, (radius - innerRadius) / 2);
	innerCornerRadiusY = $math.fitToRange(innerCornerRadiusY, 0, (radiusY - innerRadiusY) / 2);

	cornerRadius = $math.round($math.fitToRange(cornerRadius, 0, radius * crSin), 4);
	cornerRadiusY = $math.round($math.fitToRange(cornerRadiusY, 0, radiusY * crSin), 4);

	innerCornerRadius = $math.round($math.fitToRange(innerCornerRadius, 0, innerRadius * crSin), 4);
	innerCornerRadiusY = $math.round($math.fitToRange(innerCornerRadiusY, 0, innerRadiusY * crSin), 4);

	let crAngle: number = Math.asin(cornerRadius / radius / 2) * $math.DEGREES * 2;
	let crAngleY: number = Math.asin(cornerRadiusY / radiusY / 2) * $math.DEGREES * 2;

	if (innerRadius < innerCornerRadius) {
		innerRadius = innerCornerRadius;
	}

	if (innerRadiusY < innerCornerRadiusY) {
		innerRadiusY = innerCornerRadiusY;
	}

	let crInnerAngle: number = Math.asin(innerCornerRadius / innerRadius / 2) * $math.DEGREES * 2;
	let crInnerAngleY: number = Math.asin(innerCornerRadiusY / innerRadiusY / 2) * $math.DEGREES * 2;

	if (!$type.isNumber(crInnerAngle)) {
		crInnerAngle = 0;
	}
	if (!$type.isNumber(crInnerAngleY)) {
		crInnerAngleY = 0;
	}

	let middleAngle = startAngle + arc / 2;
	let mPoint = { x: $math.round($math.cos(middleAngle) * innerRadius, 4), y: $math.sin(middleAngle) * innerRadiusY };

	let a0 = { x: $math.cos(startAngle) * (innerRadius + innerCornerRadius), y: $math.sin(startAngle) * (innerRadiusY + innerCornerRadiusY) };
	let b0 = { x: $math.cos(startAngle) * (radius - cornerRadius), y: $math.sin(startAngle) * (radiusY - cornerRadiusY) };
	let c0 = { x: $math.cos(endAngle) * (radius - cornerRadius), y: $math.sin(endAngle) * (radiusY - cornerRadiusY) };
	let d0 = { x: $math.cos(endAngle) * (innerRadius + innerCornerRadius), y: $math.sin(endAngle) * (innerRadiusY + innerCornerRadiusY) };

	let b1 = { x: $math.cos(startAngle + crAngle) * radius, y: $math.sin(startAngle + crAngleY) * radiusY };
	let d1 = { x: $math.cos(endAngle - crInnerAngle) * innerRadius, y: $math.sin(endAngle - crInnerAngleY) * innerRadiusY };

	// some magic math
	innerCornerRadius += innerCornerRadius * $math.sin(crInnerAngle / 2);
	innerCornerRadiusY += innerCornerRadiusY * $math.sin(crInnerAngleY / 2);

	if (crInnerAngle > (endAngle - startAngle) / 2) {
		d1 = mPoint;
	}

	let path: string = "";
	// start from b if this is full circle
	if (arc == 360) {
		path = moveTo(b0);
	}
	// otherwise start from a
	else {
		path = moveTo(a0);
		path += lineTo(b0);
		path += arcToPoint(b1, cornerRadius, cornerRadiusY, true);
	}

	// draw arc
	path += arcTo(startAngle + crAngle, arc - 2 * crAngle, radius, radiusY);

	// draw inner arc
	if ($type.isNumber(innerRadius) && innerRadius != 0) {

		// move to B if this is full circle
		if (arc == 360 && cornerRadius == 0) {
			path += moveTo(d0);
		}
		// draw line otherwise
		else {
			path += arcToPoint(c0, cornerRadius, cornerRadiusY, true);
			path += lineTo(d0);
			path += arcToPoint(d1, innerCornerRadius, innerCornerRadiusY, true);
		}

		path += arcTo(endAngle - crInnerAngle, -(arc - 2 * crInnerAngle), innerRadius, innerRadiusY);
		if (arc < 360 || cornerRadius > 0) {
			path += arcToPoint(a0, innerCornerRadius, innerCornerRadiusY, true);
		}
		path += lineTo(a0);
	}
	else {
		path += arcToPoint(c0, cornerRadius, cornerRadiusY, true);
		if (arc < 360) {
			path += lineTo(a0);
		}
	}

	return path;
}

/**
 * Creates a path for an arc to specific coordinate.
 *
 * @ignore Exclude from docs
 * @todo Description
 * @param  {IPoint}  point         Reference point
 * @param  {number}  radius        Radius
 * @param  {number}  radiusY       Vertical radius (for skewed arcs)
 * @param  {boolean} sweepFlag     [description]
 * @param  {boolean} largeArcFlag  [description]
 * @param  {number}  xAxisRotation [description]
 * @return {string}                Arc path
 */
export function arcToPoint(point: IPoint, radius: number, radiusY?: number, sweepFlag?: boolean, largeArcFlag?: boolean, xAxisRotation?: number): string {
	if (radius == 0) {
		return "";
	}
	xAxisRotation = xAxisRotation || 0;
	largeArcFlag = Boolean(largeArcFlag);
	sweepFlag = Boolean(sweepFlag);

	let c = ",";
	let sweepFlagValue: number = +sweepFlag; // converts to 1 or 0
	let largeArcFlagValue: number = +largeArcFlag;  // converts to 1 or 0

	return " A" + radius + c + radiusY + c + xAxisRotation + c + largeArcFlagValue + c + sweepFlagValue + c + $math.round(point.x, 4) + c + $math.round(point.y, 4);
}

/**
 * Creates a new rectangle.
 *
 * @ignore Exclude from docs
 * @param  {number}  width   Width (px)
 * @param  {number}  height  Height (px)
 * @param  {number}  x       X position
 * @param  {number}  y       Y position
 * @return {string}          Rectangle
 */
export function rectangle(width: number, height: number, x?: number, y?: number): string {
	if (!$type.isNumber(x)) {
		x = 0;
	}
	if (!$type.isNumber(y)) {
		y = 0;
	}
	return moveTo({ x: x, y: y }) + lineTo({ x: x + width, y: y }) + lineTo({ x: x + width, y: y + height }) + lineTo({ x: x, y: y + height }) + closePath();
}

/**
 * Converts a rectangle to an SVG path.
 *
 * @ignore Exclude from docs
 * @param  {IRectangle}  rect  Rectangle
 * @param  {boolean}     ccw   Counter-clockwise?
 * @return {string}            SVG path
 */
export function rectToPath(rect: IRectangle, ccw?: boolean): string {
	let c = ",";
	let L = " L";
	if (ccw) {
		return "M" + rect.x
			+ c + rect.y + L + rect.x
			+ c + (rect.y + rect.height) + L + (rect.x + rect.width)
			+ c + (rect.y + rect.height) + L + (rect.x + rect.width)
			+ c + rect.y + L + rect.x
			+ c + rect.y;
	}
	else {
		return "M" + rect.x
			+ c + rect.y + L + (rect.x + rect.width)
			+ c + rect.y + L + (rect.x + rect.width)
			+ c + (rect.y + rect.height) + L + rect.x
			+ c + (rect.y + rect.height) + L + rect.x
			+ c + rect.y;
	}
}

/**
 * Converts SVG path to array of points.
 * 
 * Note, this is experimental feature based on method which is deprecated
 * on some browsers and some browsers do not support it at all.
 * 
 * You can save the output of this function, but not rely on it completely.
 */
export function pathToPoints(path: string, pointCount: number): IPoint[] {

	let paper = getGhostPaper();
	let svgPath: SVGPathElement = <any>paper.add("path").node;
	svgPath.setAttribute("d", path);

	if (svgPath.getPointAtLength && svgPath.getTotalLength) {
		let length = svgPath.getTotalLength();

		let toPoints = []
		for (let i = 0; i < pointCount; i++) {
			let point = svgPath.getPointAtLength(i / pointCount * length);
			toPoints.push({ x: point.x, y: point.y });
		}

		return toPoints;
	}

	svgPath.remove();
}