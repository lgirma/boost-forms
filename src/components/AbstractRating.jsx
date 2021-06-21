/** @jsx h */
import {h, withState} from "vdtree";

export function AbstractRating({ max = 5, value = 0, inputAttrs = {}, field }) {
    return withState(value, rating =>
        <div style={{display: 'table'}}>
            <input {...inputAttrs} hidden={true} required={false} type="number" value={rating.bind()} />
            <style>{`
                .star {cursor: pointer; font-size: 1.5em; color: darkorange;}
                .star:hover {font-weight: bold}
            `}</style>
            {new Array(max).fill(0).map((v, i) =>
                <span class="star" onclick={() => !field.readonly && rating.set(i+1)}>
                    {rating.get() > i ? '★' : '☆'}
                </span>)}
        </div>
    )
}