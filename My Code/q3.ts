import { map, zipWith } from "ramda";
import { CExp, Parsed, PrimOp, AppExp, LitExp } from "./imp/L3-ast";
import { makeAppExp, makeDefineExp, makeIfExp, makeProcExp, makeProgram, makePrimOp, makeLetExp, makeBinding, makeLitExp } from "./imp/L3-ast";
import { isAppExp, isAtomicExp, isCExp, isDefineExp, isIfExp, isLetExp, isLitExp, isPrimOp, isProcExp, isProgram } from "./imp/L3-ast";
import {isError} from './imp/error';
import { makeEmptySExp, isEmptySExp, isCompoundSExp } from "./imp/L3-value";
import {first, second, rest} from './imp/list';

//added myself
import { SExp, CompoundSExp, isSExp } from './imp/L3-value'
import { LetExp, Binding, isVarDecl, makeNumExp, makeBoolExp, makeStrExp } from './imp/L3-ast'

/*
Purpose:  The procedure gets an L3 AST and returns L30 AST.
Signature: l3ToL30(exp)
Type: [Parsed -> Parsed]
*/

export const l3ToL30 = (exp: Parsed | Error): Parsed | Error =>
    isError(exp) ? exp :
        isAppExp(exp) ? ifList(exp) :
            isLitExp(exp) && isCompoundSExp(exp.val) ? rewriteLitList(exp.val) :
                isProgram(exp) ? makeProgram(map(l3ToL30, exp.exps)) :
                    isProcExp(exp) ? makeProcExp(map(l3ToL30, exp.args), map(l3ToL30, exp.body)) :
                        isIfExp(exp) ? makeIfExp(ifList(exp.test), ifList(exp.then), ifList(exp.alt)) :
                            isLetExp(exp) ? dealWithLet(exp) :
                                isDefineExp(exp) ? makeDefineExp(exp.var, ifList(exp.val)) :
                                    exp;

const dealWithLet = (e: LetExp): Parsed =>
    makeLetExp(map(dealWithBinding, e.bindings), map(l3ToL30, e.body));

const dealWithBinding = (b: Binding): Binding =>
    isVarDecl(b.var) ? makeBinding(b.var.var, ifList(b.val)) : makeBinding(b.var, ifList(b.val));

const rewriteAllList = (rands: CExp[]): CExp[] =>
    rands.length === 1 ? [ifList(rands[0]), makeLitExp(makeEmptySExp())] : [ifList(rands[0]), makeAppExp(makePrimOp('cons'), rewriteAllList(rands.slice(1)))];

const ifList = (c: CExp): AppExp | LitExp | CExp => {
    if (isAppExp(c) && isPrimOp(c.rator) && c.rator.op === "list") {
        return makeAppExp(makePrimOp("cons"), rewriteAllList(c.rands));
    }
    if (isLitExp(c)) {
        if (isCompoundSExp(c.val))
            return rewriteLitList(c.val);
        if (isSExp(c))
            return s2c(c);
    }
    if (isAppExp(c)) {
        return makeAppExp(ifList(c.rator), map(l3ToL30, c.rands));
    }
    if (isProcExp(c)) {
        return makeProcExp(c.args, map(ifList, c.body));
    }
    return c;
}

const rewriteLitList = (e: CompoundSExp): AppExp =>
    isEmptySExp(e.val2) ? makeAppExp(makePrimOp("cons"), [s2c(e.val1), makeLitExp(makeEmptySExp())]) :
        isCompoundSExp(e.val2) ? makeAppExp(makePrimOp("cons"), [s2c(e.val1), rewriteLitList(e.val2)]) : null;

const s2c = (e: SExp): CExp =>
    typeof (e) === 'number' ? makeNumExp(e) :
        typeof (e) === 'boolean' ? makeBoolExp(e) :
            typeof (e) === 'string' ? makeStrExp(e) : null;