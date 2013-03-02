using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser
{
    /// <summary>
    /// From http://codebetter.com/matthewpodwysocki/2008/09/16/functional-c-pattern-matching/
    /// </summary>
    /// 



    public class MatchNotFoundException : Exception
    {
        public MatchNotFoundException(string message) : base(message) { }
    }

    public class PatternMatch<T, TResult>
    {
        private readonly T value;
        private readonly List<Tuple<Func<T, bool>, Func<T, TResult>>> cases
            = new List<Tuple<Func<T, bool>, Func<T, TResult>>>();
        private Func<T, TResult> elseFunc;

        internal PatternMatch(T value)
        {
            this.value = value;
        }

        public PatternMatch<T, TResult> With(Func<T, bool> condition, Func<T, TResult> result)
        {
            cases.Add(Tuple.Create(condition, result));
            return this;
        }


        public PatternMatch<T, TResult> WithType<S>(Func<S, TResult> result) where S : class
        {
            Func<T, bool> test = t => {
                var s = t as S;
                return s != null;
            };
            Func<T, TResult> r = t =>
            {
                var s = t as S;
                return result(s);
            };
            cases.Add(Tuple.Create(test, r));
            return this;
        }

        public PatternMatch<T, TResult> Else(Func<T, TResult> result)
        {
            if (elseFunc != null)
                throw new InvalidOperationException("Cannot have multiple else cases");

            elseFunc = result;
            return this;
        }

        public TResult Do()
        {
            if (elseFunc != null)
                cases.Add(
                    Tuple.Create<Func<T, bool>, Func<T, TResult>>(x => true, elseFunc));
            foreach (var item in cases)
                if (item.Item1(value))
                    return item.Item2(value);

            throw new MatchNotFoundException("Incomplete pattern match");
        }
    }


    public class PatternMatchContext<T>
    {
        private readonly T value;
        internal PatternMatchContext(T value)
        {
            this.value = value;
        }

        public PatternMatch<T, TResult> With<TResult>(
            Func<T, bool> condition,
            Func<T, TResult> result)
        {
            var match = new PatternMatch<T, TResult>(value);
            return match.With(condition, result);
        }

        //public PatternMatch<T, TResult> WithType<S, TResult>(Func<S, TResult> result) where S : class
        //{
        //    var match = new PatternMatch<T, TResult>(value);
        //    return match.WithType<S>(result);
        //}
            
    }

    public static class PatternMatchExtensions
    {
        public static PatternMatchContext<T> Match<T>(this T value)
        {
            return new PatternMatchContext<T>(value);
        }
    }
}
