import { map } from "ramda";
import { Parsed, AppExp, isProgram, isBoolExp, isNumExp, isVarRef, isPrimOp, isLitExp, isProcExp, isIfExp, isAppExp, isDefineExp, isLetExp, PrimOp, CExp } from './imp/L3-ast';
import {parsedToString} from './imp/L3-value';
import {isError} from './imp/error';

/*
Purpose: The procedure gets an L2 AST and returns a string of the equivalent Python program
Signature: l2ToPython(exp)
Type: [Parsed -> String]
*/
export const l2ToPython = (exp: Parsed | Error): string | Error =>
   isError(exp) ? exp.message :
      isProgram(exp) ? map(l2ToPython, exp.exps).join("\n") :
         isBoolExp(exp) ? (exp.val ? 'true' : 'false') :
            isNumExp(exp) ? exp.val.toString() :
               isVarRef(exp) ? exp.var :
                  isPrimOp(exp) ? exp.op === "=" ? "==" : exp.op :
                     isDefineExp(exp) ? exp.var.var + " = " + l2ToPython(exp.val) :
                        isProcExp(exp) ? "(" + "lambda " + map((p) => p.var, exp.args).join(", ") + ": " + map(l2ToPython, exp.body).join(" ") + ")" :
                           isIfExp(exp) ? "(" + l2ToPython(exp.then) + " " + "if " + l2ToPython(exp.test) + " else " + l2ToPython(exp.alt) + ")" :
                              isAppExp(exp) ? isPrimOp(exp.rator) ? exp.rator.op === "not" ? "(" + l2ToPython(exp.rator) + " " + map(l2ToPython, exp.rands).join(" ") + ")" :
                                 "(" + map(l2ToPython, exp.rands).join(" " + l2ToPython(exp.rator) + " ") + ")" :
                                 l2ToPython(exp.rator) + "(" + map(l2ToPython, exp.rands).join(",") + ")" :
                                 isLitExp(exp) ? exp.val :
                                    exp;